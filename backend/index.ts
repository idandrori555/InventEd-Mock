import express from 'express';
import cors from 'cors';
import { setupDatabase } from './src/db/setup';
import taskRoutes from './src/routes/tasks';
import lessonRoutes from './src/routes/lessons';

// Initialize database
setupDatabase();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

import authRoutes from './src/routes/auth';
import groupRoutes from './src/routes/groups';
import studentRoutes from './src/routes/student';

// Routes
app.use('/auth', authRoutes); // Public route
app.use('/tasks', taskRoutes);
app.use('/lessons', lessonRoutes);
app.use('/groups', groupRoutes);
app.use('/student', studentRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
