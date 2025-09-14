import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '@/lib/api';
import type { Task } from 'common/types';
import StartLessonModal from '@/components/StartLessonModal';

export default function TeacherTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

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

  const openStartLessonModal = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  if (loading) return <div className="text-center p-4">Loading tasks...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      {isModalOpen && selectedTaskId && (
        <StartLessonModal taskId={selectedTaskId} onClose={handleCloseModal} />
      )}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <Link
            to="/teacher/tasks/new"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + Create New Task
          </Link>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li key={task.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-indigo-600 truncate">{task.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button 
                          onClick={() => openStartLessonModal(task.id)}
                          className="px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Start Lesson
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {task.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{task.questions.length} questions</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No tasks found. Create one to get started!
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
