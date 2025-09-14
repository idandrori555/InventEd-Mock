import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

// Extend the Express Request type to include our user payload
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: string;
                name: string;
            }
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
