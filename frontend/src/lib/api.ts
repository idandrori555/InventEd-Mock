import type {
  Task,
  Lesson,
  StudentAnswers,
  Question,
  StudentAnswerChoice,
  Group,
  User,
} from "common/types";

const API_URL = "http://10.100.102.26:3000";

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.append("Content-Type", "application/json");

  const token = localStorage.getItem("authToken");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Auto-logout on 401 responses
      logout();
      window.location.href = "/login";
    }
    const error = await response
      .json()
      .catch(() => ({ message: "An unknown error occurred" }));
    throw new Error(error.message);
  }

  if (response.status === 204) {
    // No Content
    return;
  }

  return response.json();
}

// --- Auth Routes ---

export const login = async (
  personalId: string,
  role: "teacher" | "student",
): Promise<{ token: string }> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personalId, role }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Login failed" }));
    throw new Error(error.message);
  }

  return response.json();
};

export const logout = () => {
  localStorage.removeItem("authToken");
};

// --- Task Routes ---

export const getTasks = (): Promise<Task[]> => {
  return request("/tasks");
};

export const getTask = (id: number): Promise<Task> => {
  return request(`/tasks/${id}`);
};

export const createTask = (data: {
  title: string;
  description: string;
  questions: Question[];
}): Promise<Task> => {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// --- Lesson Routes ---

export const startLesson = (data: {
  groupId: number;
  taskId: number;
}): Promise<Lesson> => {
  return request("/lessons/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getActiveLessonForGroup = (groupId: number): Promise<Lesson> => {
    return request(`/groups/${groupId}/active-lesson`);
};

export const submitAnswers = (
  lessonId: number,
  answers: StudentAnswerChoice[],
): Promise<StudentAnswers> => {
  return request(`/lessons/${lessonId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
};

export const getLessonAnalytics = (
  lessonId: number,
): Promise<{
  averageScore: number;
  submissions: { score: number; studentName: string }[];
}> => {
  return request(`/lessons/${lessonId}/analytics`);
};

// --- Group Routes ---

export const getGroups = (): Promise<Group[]> => {
  return request("/groups");
};

export const getGroup = (id: number): Promise<Group & { students: User[] }> => {
  return request(`/groups/${id}`);
};

export const createGroup = (name: string, file: File): Promise<Group> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    return request('/groups', {
        method: 'POST',
        body: formData,
    });
};
