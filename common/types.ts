export interface User {
  id: number;
  name: string;
  role: 'teacher' | 'student';
  personalId: string;
}

export interface Group {
  id: number;
  name: string;
  teacherId: number;
}

export interface GroupStudent {
  id: number;
  groupId: number;
  studentId: number;
}

// Defining question structures for clarity
export interface Question {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  type?: 'multiple-choice' | 'open-ended';
}

export interface Task {
  id: number;
  title: string;
  description: string;
  questions: Question[]; // Stored as JSON in DB
  teacherId: number;
}

export interface Lesson {
  id: number;
  groupId: number;
  startTime: string; // ISO 8601 date string
  endTime: string | null; // ISO 8601 date string or null if active
}

// Defining student answer structures
export interface StudentAnswerChoice {
  questionIndex: number;
  selectedAnswer?: number; // index of the selected option
  textAnswer?: string;
}

export interface StudentAnswers {
  id: number;
  lessonId: number;
  studentId: number;
  answers: StudentAnswerChoice[]; // Stored as JSON in DB
  score: number;
}
