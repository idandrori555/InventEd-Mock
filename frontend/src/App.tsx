import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TeacherGroupsPage from './pages/teacher/GroupsPage';
import TeacherTasksPage from './pages/teacher/TeacherTasksPage';
import TeacherTaskCreatePage from './pages/teacher/TeacherTaskCreatePage';
import TeacherGroupDetailPage from './pages/teacher/TeacherGroupDetailPage';
import TeacherLessonAnalyticsPage from './pages/teacher/TeacherLessonAnalyticsPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentGroupsPage from './pages/student/GroupsPage';
import StudentTaskSolverPage from './pages/student/StudentTaskSolverPage';
import StudentPastLessonsPage from './pages/student/StudentPastLessonsPage';
import StudentLessonPage from './pages/student/StudentLessonPage';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';


import StudentGroupDetailPage from './pages/student/GroupDetailPage';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = "text-slate-600 hover:text-indigo-600 font-medium";
  const mobileNavLinkClasses = "text-slate-700 hover:bg-slate-100 block px-3 py-2 rounded-md text-base font-medium";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="h-8 w-8 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <Link to="/" className="font-bold text-xl text-slate-800">
                        InventEd
                    </Link>
                </div>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8 ml-10">
                {user?.role === 'teacher' && (
                  <>
                    <Link to="/teacher/groups" className={navLinkClasses}>Groups</Link>
                    <Link to="/teacher/tasks" className={navLinkClasses}>Tasks</Link>
                  </>
                )}
                {user?.role === 'student' && (
                  <>
                    <Link to="/student/groups" className={navLinkClasses}>My Groups</Link>
                    <Link to="/student/history" className={navLinkClasses}>Lesson History</Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center">
              {user ? (
                <>
                  <span className="mr-4 text-sm text-slate-600">Welcome, {user.name}</span>
                  <button onClick={handleLogout} className="text-sm font-medium text-slate-600 hover:text-indigo-600">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
                  Login
                </Link>
              )}
            </div>
            {/* Mobile Menu Button */}
            <div className="-mr-2 flex items-center md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className="bg-white inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user?.role === 'teacher' && (
              <>
                <Link to="/teacher/groups" className={mobileNavLinkClasses}>Groups</Link>
                <Link to="/teacher/tasks" className={mobileNavLinkClasses}>Tasks</Link>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <Link to="/student/groups" className={mobileNavLinkClasses}>My Groups</Link>
                <Link to="/student/history" className={mobileNavLinkClasses}>Lesson History</Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            {user ? (
              <div className="px-2 space-y-2">
                <div className="px-3">
                    <div className="text-base font-medium text-slate-800">{user.name}</div>
                </div>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100">
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2">
                <Link to="/login" className="w-full block text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />

            {/* Protected Teacher Routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/groups" element={<TeacherGroupsPage />} />
              <Route path="/teacher/groups/:id" element={<TeacherGroupDetailPage />} />
              <Route path="/teacher/tasks" element={<TeacherTasksPage />} />
              <Route path="/teacher/tasks/new" element={<TeacherTaskCreatePage />} />
              <Route path="/teacher/lessons/:id/analytics" element={<TeacherLessonAnalyticsPage />} />
            </Route>

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/groups" element={<StudentGroupsPage />} />
              <Route path="/student/groups/:id" element={<StudentGroupDetailPage />} />
              <Route path="/student/history" element={<StudentPastLessonsPage />} />
              <Route path="/lessons/:lessonId" element={<StudentLessonPage />} />
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
