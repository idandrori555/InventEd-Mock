import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getActiveLessonForGroup } from '@/lib/api';
import type { Lesson } from 'common/types';

export default function StudentGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      try {
        const lesson = await getActiveLessonForGroup(Number(id));
        setActiveLesson(lesson);
      } catch (err) {
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
  }, [id]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Group Details</h1>
      {loading && <div className="text-center p-4">Searching for active lesson...</div>}
      {!loading && error && <div className="text-center p-4 text-red-500">Error: {error}</div>}
      {!loading && !error && (
        activeLesson ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold">An lesson is active!</h2>
            <p className="text-gray-600 my-4">A lesson has been started for this group.</p>
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
            <p className="text-gray-600 my-4">There are no active lessons for this group right now.</p>
          </div>
        )
      )}
    </div>
  );
}
