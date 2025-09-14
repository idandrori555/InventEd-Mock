import { Router } from 'express';
import db from '../db/setup';
import { protect } from '../middleware/authMiddleware';
import type { Lesson, StudentAnswerChoice, Task } from '../../../common/types';

const router = Router();

// All lesson routes are protected
router.use(protect);

// POST /lessons/start -> start a lesson with group + task
router.post('/start', (req, res) => {
  const teacherId = req.user.id;
  const { groupId, taskId } = req.body;

  if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can start lessons.' });
  }
  if (!groupId || !taskId) {
    return res.status(400).json({ message: 'groupId and taskId are required' });
  }

  try {
    const groupQuery = db.query('SELECT teacherId FROM Groups WHERE id = ?');
    const group = groupQuery.get(groupId) as { teacherId: number } | null;
    if (group?.teacherId !== teacherId) {
        return res.status(403).json({ message: 'Forbidden: You do not own this group.' });
    }

    const startTime = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO Lessons (groupId, taskId, startTime) VALUES (?, ?, ?)');
    const info = stmt.run(groupId, taskId, startTime);

    const newLesson = db.query('SELECT * FROM Lessons WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newLesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error starting lesson' });
  }
});



// POST /lessons/:id/submit -> submit student answers
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
        const lessonQuery = db.query('SELECT taskId FROM Lessons WHERE id = ?');
        const lesson = lessonQuery.get(lessonId) as { taskId: number } | null;
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const taskQuery = db.query('SELECT questions FROM Tasks WHERE id = ?');
        const task = taskQuery.get(lesson.taskId) as { questions: string } | null;
        if (!task) {
            return res.status(404).json({ message: 'Task not found for this lesson' });
        }

        const correctQuestions = JSON.parse(task.questions);
        let score = 0;
        answers.forEach(studentAnswer => {
            const question = correctQuestions[studentAnswer.questionIndex];
            if (question && question.correctAnswer === studentAnswer.selectedAnswer) {
                score++;
            }
        });
        const finalScore = Math.round((score / correctQuestions.length) * 100);

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


// GET /lessons/:id/analytics -> teacher sees score per student + class average
router.get('/:id/analytics', (req, res) => {
    const teacherId = req.user.id;
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

        if (submissions.length === 0) {
            return res.json({
                averageScore: 0,
                submissions: []
            });
        }

        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
        const averageScore = Math.round(totalScore / submissions.length);

        res.json({
            averageScore,
            submissions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching lesson analytics' });
    }
});


export default router;
