import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '@/lib/api';
import type { Task } from 'common/types';

export default function TeacherTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div className="text-center p-4">Loading tasks...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
        <Link
          to="/teacher/tasks/new"
          className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Create New Task
        </Link>
      </div>
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 truncate">{task.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">{task.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">{task.questions.length} questions</p>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-700">No tasks found</h2>
            <p className="mt-2 text-sm text-slate-500">Create your first task to get started!</p>
            <Link
                to="/teacher/tasks/new"
                className="mt-6 inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                + Create New Task
            </Link>
        </div>
      )}
    </div>
  );
}
