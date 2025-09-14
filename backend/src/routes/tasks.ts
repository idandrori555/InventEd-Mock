import { Router } from 'express';
import db from '../db/setup';
import { protect } from '../middleware/authMiddleware';
import type { Task, Question } from '../../../common/types';

const router = Router();

// All task routes are protected
router.use(protect);

// GET /tasks -> list tasks for teacher
router.get('/', (req, res) => {
  const teacherId = req.user.id;

  // Ensure user is a teacher
  if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can view all tasks.' });
  }

  try {
    const tasksQuery = db.query('SELECT * FROM Tasks WHERE teacherId = ?');
    const tasks = tasksQuery.all(teacherId) as Task[];
    
    const tasksWithParsedQuestions = tasks.map(task => ({
        ...task,
        questions: JSON.parse(task.questions as unknown as string)
    }));

    res.json(tasksWithParsedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// POST /tasks -> create a task
router.post('/', (req, res) => {
  const teacherId = req.user.id;
  const { title, description, questions } = req.body as { title: string, description: string, questions: Question[] };

  if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can create tasks.' });
  }

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Missing required fields: title and questions are required.' });
  }

  try {
    const questionsString = JSON.stringify(questions);
    const stmt = db.prepare('INSERT INTO Tasks (title, description, questions, teacherId) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, description, questionsString, teacherId);

    const newTaskQuery = db.query('SELECT * FROM Tasks WHERE id = ?');
    const newTask = newTaskQuery.get(info.lastInsertRowid) as Task;
    
    const taskWithParsedQuestions = {
        ...newTask,
        questions: JSON.parse(newTask.questions as unknown as string)
    };

    res.status(201).json(taskWithParsedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// GET /tasks/:id -> get task details
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const taskQuery = db.query('SELECT * FROM Tasks WHERE id = ?');
    const task = taskQuery.get(id) as Task;

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Optional: Check if the user is the teacher who owns the task or a student in a group that has a lesson with this task.
    // For now, any authenticated user can fetch a task by ID.

    const taskWithParsedQuestions = {
        ...task,
        questions: JSON.parse(task.questions as unknown as string)
    };

    res.json(taskWithParsedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching task' });
  }
});


export default router;
