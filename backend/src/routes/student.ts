import { Router } from 'express';
import db from '../db/setup';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All student routes are protected
router.use(protect);

// GET /student/lessons/history -> Get all past lessons and scores for the logged-in student
router.get('/lessons/history', (req, res) => {
    const studentId = req.user.id;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Forbidden: Only students can view their history.' });
    }

    try {
        const historyQuery = db.query(`
            SELECT 
                l.id as lessonId,
                l.startTime,
                sa.score,
                t.title as taskTitle
            FROM StudentAnswers sa
            JOIN Lessons l ON sa.lessonId = l.id
            -- This part is tricky with multiple tasks. We'll just get the first task's title for now.
            JOIN LessonTasks lt ON l.id = lt.lessonId
            JOIN Tasks t ON lt.taskId = t.id
            WHERE sa.studentId = ?
            GROUP BY l.id
            ORDER BY l.startTime DESC
        `);

        const history = historyQuery.all(studentId);
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching lesson history' });
    }
});

export default router;
