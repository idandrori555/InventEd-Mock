import { Router } from 'express';
import db from '../db/setup';
import jwt from 'jsonwebtoken';
import type { User } from '../../../common/types';

const router = Router();

// For simplicity, using a hardcoded secret. In a real app, use an environment variable.
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

router.post('/login', (req, res) => {
    const { personalId, role } = req.body;

    if (!personalId || !role) {
        return res.status(400).json({ message: 'Personal ID and role are required' });
    }

    try {
        const userQuery = db.query('SELECT * FROM Users WHERE personalId = ? AND role = ?');
        const user = userQuery.get(personalId, role) as User | null;

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

export default router;
