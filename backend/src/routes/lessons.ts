import { Router } from 'express';
import db from '../db/setup';
import { protect } from '../middleware/authMiddleware';
import type { Question, StudentAnswerChoice } from '../../../common/types';

const router = Router();

// All lesson routes are protected
router.use(protect);

// POST /lessons/start -> start a lesson with a group and one or more tasks
router.post('/start', (req, res) => {
  const teacherId = req.user.id;
  const { groupId, taskIds } = req.body as { groupId: number; taskIds: number[] };

  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden: Only teachers can start lessons.' });
  }
  if (!groupId || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ message: 'groupId and a non-empty array of taskIds are required' });
  }

  try {
    const groupQuery = db.query('SELECT teacherId FROM Groups WHERE id = ?');
    const group = groupQuery.get(groupId) as { teacherId: number } | null;
    if (group?.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this group.' });
    }

    const startLessonTransaction = db.transaction(() => {
        const startTime = new Date().toISOString();
        const lessonStmt = db.prepare('INSERT INTO Lessons (groupId, startTime) VALUES (?, ?)');
        const lessonInfo = lessonStmt.run(groupId, startTime);
        const lessonId = lessonInfo.lastInsertRowid;

        const lessonTaskStmt = db.prepare('INSERT INTO LessonTasks (lessonId, taskId) VALUES (?, ?)');
        for (const taskId of taskIds) {
            lessonTaskStmt.run(lessonId, taskId);
        }

        return db.query('SELECT * FROM Lessons WHERE id = ?').get(lessonId);
    });

    const newLesson = startLessonTransaction();
    res.status(201).json(newLesson);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error starting lesson' });
  }
});

// GET /lessons/:id/tasks -> Get all tasks for a specific lesson
router.get('/:id/tasks', (req, res) => {
    const lessonId = req.params.id;

    try {
        const tasksQuery = db.query(`
            SELECT t.* FROM Tasks t
            JOIN LessonTasks lt ON t.id = lt.taskId
            WHERE lt.lessonId = ?
        `);
        const tasks = tasksQuery.all(lessonId);
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks for lesson' });
    }
});

// POST /lessons/:id/attend -> Mark student as present for a lesson
router.post('/:id/attend', (req, res) => {
    const studentId = req.user.id;
    const lessonId = req.params.id;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Forbidden: Only students can mark attendance.' });
    }

    try {
        const joinTime = new Date().toISOString();
        const stmt = db.prepare('INSERT INTO Attendance (lessonId, studentId, joinTime) VALUES (?, ?, ?)');
        stmt.run(lessonId, studentId, joinTime);
        res.status(201).json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(200).json({ message: 'Attendance already marked.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error marking attendance' });
    }
});

// POST /lessons/:id/submit -> submit student answers for all tasks in a lesson
router.post('/:id/submit', (req, res) => {
    const studentId = req.user.id;
    const lessonId = req.params.id;
    const { answers } = req.body as { answers: StudentAnswerChoice[] };

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Forbidden: Only students can submit answers.' });
    }
    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Answers are required' });
    }

    try {
        // Get all questions for all tasks in the lesson
        const tasksQuery = db.query(`
            SELECT t.id, t.questions FROM Tasks t
            JOIN LessonTasks lt ON t.id = lt.taskId
            WHERE lt.lessonId = ?
        `);
        const tasks = tasksQuery.all(lessonId) as { id: number, questions: string }[];
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this lesson' });
        }

        const allQuestions: Question[] = tasks.flatMap(task => JSON.parse(task.questions));
        const multipleChoiceQuestions = allQuestions.filter(q => q.type === 'multiple-choice' || q.type === undefined);

        let score = 0;
        answers.forEach(studentAnswer => {
            const question = allQuestions[studentAnswer.questionIndex];
            // Only score multiple choice questions
            if (question && (question.type === 'multiple-choice' || question.type === undefined) && question.correctAnswer === studentAnswer.selectedAnswer) {
                score++;
            }
        });
        
        const finalScore = multipleChoiceQuestions.length > 0 
            ? Math.round((score / multipleChoiceQuestions.length) * 100)
            : 100; // If no multiple choice questions, score is 100

        const answersString = JSON.stringify(answers);
        const stmt = db.prepare('INSERT INTO StudentAnswers (lessonId, studentId, answers, score) VALUES (?, ?, ?, ?)');
        const info = stmt.run(lessonId, studentId, answersString, finalScore);

        const newSubmission = db.query('SELECT * FROM StudentAnswers WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newSubmission);

    } catch (error) {
        console.error(error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'You have already submitted answers for this lesson.' });
        }
        res.status(500).json({ message: 'Error submitting answers' });
    }
});

// GET /lessons/:id/live -> Get live status of a lesson for the teacher
router.get('/:id/live', (req, res) => {
    const lessonId = req.params.id;

    if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Forbidden: Only teachers can view live lesson data.' });
    }

    try {
        const attendeesQuery = db.query(`
            SELECT u.id, u.name FROM Users u
            JOIN Attendance a ON u.id = a.studentId
            WHERE a.lessonId = ?
        `);
        const attendees = attendeesQuery.all(lessonId);

        const submissionsQuery = db.query(`
            SELECT u.id, u.name FROM Users u
            JOIN StudentAnswers sa ON u.id = sa.studentId
            WHERE sa.lessonId = ?
        `);
        const submitters = submissionsQuery.all(lessonId);

        res.json({ attendees, submitters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching live lesson data' });
    }
});


// GET /lessons/:id/analytics -> teacher sees score per student + class average
router.get('/:id/analytics', (req, res) => {
    const lessonId = req.params.id;

    if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Forbidden: Only teachers can view analytics.' });
    }

    try {
        const submissionsQuery = db.query(`
            SELECT sa.score, u.name as studentName
            FROM StudentAnswers sa
            JOIN Users u ON sa.studentId = u.id
            WHERE sa.lessonId = ?
        `);
        const submissions = submissionsQuery.all(lessonId) as { score: number, studentName: string }[];

        const attendeesQuery = db.query(`
            SELECT u.id, u.name as studentName FROM Users u
            JOIN Attendance a ON u.id = a.studentId
            WHERE a.lessonId = ?
        `);
        const attendees = attendeesQuery.all(lessonId);

        if (submissions.length === 0) {
            return res.json({
                averageScore: 0,
                submissions: [],
                attendees
            });
        }

        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
        const averageScore = Math.round(totalScore / submissions.length);

        res.json({
            averageScore,
            submissions,
            attendees
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching lesson analytics' });
    }
});


export default router;
