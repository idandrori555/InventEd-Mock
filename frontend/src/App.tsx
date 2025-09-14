import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TeacherGroupsPage from './pages/teacher/GroupsPage';
import TeacherTasksPage from './pages/teacher/TeacherTasksPage';
import TeacherTaskCreatePage from './pages/teacher/TeacherTaskCreatePage';
import TeacherLessonAnalyticsPage from './pages/teacher/TeacherLessonAnalyticsPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentGroupsPage from './pages/student/GroupsPage';
import StudentTaskSolverPage from './pages/student/StudentTaskSolverPage';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';


import StudentGroupDetailPage from './pages/student/GroupDetailPage';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex-shrink-0 flex items-center font-bold text-xl">
                InventEd
              </Link>
              {user?.role === 'teacher' && (
                <>
                  <Link to="/teacher/groups" className="text-gray-500 hover:text-gray-700">
                    Groups
                  </Link>
                  <Link to="/teacher/tasks" className="text-gray-500 hover:text-gray-700">
                    Tasks
                  </Link>
                </>
              )}
              {user?.role === 'student' && (
                 <>
                  <Link to="/student/groups" className="text-gray-500 hover:text-gray-700">
                    My Groups
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <span className="mr-4 text-gray-800">Welcome, {user.name}</span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />

            {/* Protected Teacher Routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/groups" element={<TeacherGroupsPage />} />
              <Route path="/teacher/tasks" element={<TeacherTasksPage />} />
              <Route path="/teacher/tasks/new" element={<TeacherTaskCreatePage />} />
              <Route path="/teacher/lessons/:id/analytics" element={<TeacherLessonAnalyticsPage />} />
            </Route>

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/groups" element={<StudentGroupsPage />} />
              <Route path="/student/groups/:id" element={<StudentGroupDetailPage />} />
              <Route path="/lessons/:lessonId/task/:taskId" element={<StudentTaskSolverPage />} />
            </Route>
            
            {/* Catch-all or 404 Not Found Route could be added here */}
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
