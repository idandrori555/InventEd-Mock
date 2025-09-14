import { Router } from 'express';
import db from '../db/setup';
import { protect } from '../middleware/authMiddleware';
import type { User, Group } from '../../../common/types';

const router = Router();

// All group routes are protected
router.use(protect);

// GET /groups -> list groups for user (teacher or student)
router.get('/', (req, res) => {
    const { id: userId, role } = req.user;

    try {
        let groups;
        if (role === 'teacher') {
            const groupsQuery = db.query('SELECT * FROM Groups WHERE teacherId = ?');
            groups = groupsQuery.all(userId);
        } else { // student
            const groupsQuery = db.query(`
                SELECT g.* FROM Groups g
                JOIN GroupStudents gs ON g.id = gs.groupId
                WHERE gs.studentId = ?
            `);
            groups = groupsQuery.all(userId);
        }
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching groups' });
    }
});

// POST /groups -> create group (teacher)
router.post('/', (req, res) => {
    const { id: teacherId, role } = req.user;
    const { name } = req.body;

    if (role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can create groups' });
    }
    if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    try {
        const stmt = db.prepare('INSERT INTO Groups (name, teacherId) VALUES (?, ?)');
        const info = stmt.run(name, teacherId);

        const newGroup = db.query('SELECT * FROM Groups WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating group' });
    }
});

// GET /groups/:id -> group info including students
router.get('/:id', (req, res) => {
    const { id: groupId } = req.params;
    // Optional: Could add logic here to ensure the requesting user is the teacher of the group or a student in it.

    try {
        const groupQuery = db.query('SELECT * FROM Groups WHERE id = ?');
        const group = groupQuery.get(groupId) as Group | null;
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const studentsQuery = db.query(`
            SELECT u.id, u.name, u.personalId FROM Users u
            JOIN GroupStudents gs ON u.id = gs.studentId
            WHERE gs.groupId = ?
        `);
        const students = studentsQuery.all(groupId);

        res.json({ ...group, students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching group details' });
    }
});

export default router;
