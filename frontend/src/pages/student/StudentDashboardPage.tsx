import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveLesson } from '@/lib/api';
import type { Lesson } from 'common/types';

export default function StudentDashboardPage() {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lesson = await getActiveLesson();
        setActiveLesson(lesson);
      } catch (err) {
        // It's common for no active lesson to be found (404), so we don't treat it as a critical error.
        if (err.message.includes('No active lesson found')) {
            setActiveLesson(null);
        } else {
            setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, []);

  if (loading) return <div className="text-center p-4">Searching for active lesson...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      {activeLesson ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold">An lesson is active!</h2>
          <p className="text-gray-600 my-4">A lesson has been started for your group.</p>
          <Link
            to={`/lessons/${activeLesson.id}/task/${activeLesson.taskId}`}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Join Lesson
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold">No Active Lesson</h2>
          <p className="text-gray-600 my-4">There are no active lessons for your group right now. Please wait for your teacher to start one.</p>
        </div>
      )}
    </div>
  );
}
