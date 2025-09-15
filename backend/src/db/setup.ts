import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const dbDir = path.resolve(__dirname, "../../db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "invented.db");
export { dbPath };
const db = new Database(dbPath);

const schema = `
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
    personalId TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS Groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    teacherId INTEGER NOT NULL,
    FOREIGN KEY (teacherId) REFERENCES Users(id)
  );

  CREATE TABLE IF NOT EXISTS GroupStudents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupId INTEGER NOT NULL,
    studentId INTEGER NOT NULL,
    FOREIGN KEY (groupId) REFERENCES Groups(id),
    FOREIGN KEY (studentId) REFERENCES Users(id),
    UNIQUE(groupId, studentId)
  );

  CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    questions TEXT NOT NULL, -- JSON blob. Structure: { type: 'multiple-choice' | 'open-ended', ... }
    teacherId INTEGER NOT NULL,
    FOREIGN KEY (teacherId) REFERENCES Users(id)
  );

  CREATE TABLE IF NOT EXISTS Lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupId INTEGER NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    FOREIGN KEY (groupId) REFERENCES Groups(id)
  );

  CREATE TABLE IF NOT EXISTS LessonTasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lessonId INTEGER NOT NULL,
    taskId INTEGER NOT NULL,
    FOREIGN KEY (lessonId) REFERENCES Lessons(id),
    FOREIGN KEY (taskId) REFERENCES Tasks(id),
    UNIQUE(lessonId, taskId)
  );

  CREATE TABLE IF NOT EXISTS StudentAnswers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lessonId INTEGER NOT NULL,
    studentId INTEGER NOT NULL,
    answers TEXT NOT NULL, -- JSON blob
    score INTEGER,
    FOREIGN KEY (lessonId) REFERENCES Lessons(id),
    FOREIGN KEY (studentId) REFERENCES Users(id),
    UNIQUE(lessonId, studentId)
  );

  CREATE TABLE IF NOT EXISTS Attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lessonId INTEGER NOT NULL,
    studentId INTEGER NOT NULL,
    joinTime DATETIME NOT NULL,
    FOREIGN KEY (lessonId) REFERENCES Lessons(id),
    FOREIGN KEY (studentId) REFERENCES Users(id),
    UNIQUE(lessonId, studentId)
  );
`;

function seed() {
  // Use a transaction for performance
  const insert = db.transaction(() => {
    // Check if data already exists
    const userCount = db.query("SELECT COUNT(*) as count FROM Users").get() as {
      count: number;
    };
    if (userCount.count > 0) {
      // console.log('Database already seeded.');
      return;
    }

    console.log("Seeding database...");

    // Create Users
    const teacherStmt = db.prepare(
      "INSERT INTO Users (name, role, personalId) VALUES (?, ?, ?)",
    );
    teacherStmt.run("Ada Lovelace", "teacher", "T01");

    const studentStmt = db.prepare(
      "INSERT INTO Users (name, role, personalId) VALUES (?, ?, ?)",
    );
    studentStmt.run("Charles Babbage", "student", "S01");
    studentStmt.run("Grace Hopper", "student", "S02");
    studentStmt.run("Alan Turing", "student", "S03");

    // Create Group
    const groupStmt = db.prepare(
      "INSERT INTO Groups (name, teacherId) VALUES (?, ?)",
    );
    groupStmt.run("Mathematics Pioneers", 1); // Assuming Ada is teacherId 1

    // Assign Students to Group
    const groupStudentStmt = db.prepare(
      "INSERT INTO GroupStudents (groupId, studentId) VALUES (?, ?)",
    );
    groupStudentStmt.run(1, 2); // Group 1, Student 2 (Charles)
    groupStudentStmt.run(1, 3); // Group 1, Student 3 (Grace)
    groupStudentStmt.run(1, 4); // Group 1, Student 4 (Alan)

    console.log("Seeding complete.");
  });

  insert();
}

export function setupDatabase() {
  db.exec(schema);
  console.log("Database schema setup complete.");
  seed(); // Call the seed function
}

// Also export the db instance for use in other parts of the app
export default db;
