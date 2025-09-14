import { Router } from 'express';
import db from '../db/setup';
import { protect } from '../middleware/authMiddleware';
import type { User, Group } from '../../../common/types';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';

const router = Router();

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

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

// POST /groups -> create group with Excel file
router.post('/', upload.single('file'), (req, res) => {
    const { id: teacherId, role } = req.user;
    const { name } = req.body;
    const file = req.file;

    if (role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can create groups' });
    }
    if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }
    if (!file) {
        return res.status(400).json({ message: 'Excel file is required' });
    }

    const transaction = db.transaction((groupName, students) => {
        // 1. Create the group
        const groupStmt = db.prepare('INSERT INTO Groups (name, teacherId) VALUES (?, ?)');
        const groupInfo = groupStmt.run(groupName, teacherId);
        const groupId = groupInfo.lastInsertRowid;

        const findUserStmt = db.prepare('SELECT id FROM Users WHERE personalId = ?');
        const createUserStmt = db.prepare('INSERT INTO Users (name, personalId, role) VALUES (?, ?, \'student\')');
        const addStudentToGroupStmt = db.prepare('INSERT INTO GroupStudents (groupId, studentId) VALUES (?, ?)');

        for (const student of students) {
            // Assuming columns are 'Name' and 'PersonalID'
            const studentName = student.Name;
            const personalId = student.PersonalID;

            if (!studentName || !personalId) {
                console.warn('Skipping row due to missing Name or PersonalID:', student);
                continue;
            }

            // 2. Find or create the student
            let user = findUserStmt.get(personalId) as { id: number } | null;
            let studentId;

            if (user) {
                studentId = user.id;
            } else {
                const newUserInfo = createUserStmt.run(studentName, personalId);
                studentId = newUserInfo.lastInsertRowid;
            }

            // 3. Add student to the group
            addStudentToGroupStmt.run(groupId, studentId);
        }
        return db.query('SELECT * FROM Groups WHERE id = ?').get(groupId);
    });

    try {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const students = xlsx.utils.sheet_to_json(sheet);

        if (students.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty or in the wrong format.' });
        }

        const newGroup = transaction(name, students);
        res.status(201).json(newGroup);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating group from Excel file.' });
    } finally {
        // Clean up the uploaded file
        fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });
    }
});


// GET /groups/:id -> group info including students
router.get('/:id', (req, res) => {
    const { id: groupId } = req.params;

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

// GET /groups/:id/active-lesson -> get active lesson for a specific group
router.get('/:id/active-lesson', (req, res) => {
    const { id: groupId } = req.params;

    try {
        const activeLessonQuery = db.query('SELECT * FROM Lessons WHERE groupId = ? AND endTime IS NULL ORDER BY startTime DESC LIMIT 1');
        const activeLesson = activeLessonQuery.get(groupId);

        if (!activeLesson) {
            return res.status(404).json({ message: 'No active lesson found for this group.' });
        }

        res.json(activeLesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching active lesson for group' });
    }
});


export default router;