import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLessonAnalytics } from '@/lib/api';

interface AnalyticsData {
  averageScore: number;
  submissions: {
    score: number;
    studentName: string;
  }[];
}

export default function TeacherLessonAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAnalytics = async () => {
      try {
        const data = await getLessonAnalytics(Number(id));
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading analytics...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!analytics) return <div className="text-center p-4">No analytics data found.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Lesson Analytics</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4 sm:p-6">
        <h2 className="text-xl font-semibold">Class Average Score</h2>
        <p className="text-4xl font-bold text-indigo-600">{analytics.averageScore}%</p>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Student Submissions</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {analytics.submissions.length > 0 ? (
            analytics.submissions.map((sub, index) => (
              <li key={index}>
                <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                  <p className="text-lg font-medium text-gray-800">{sub.studentName}</p>
                  <p className="text-lg font-semibold text-gray-600">{sub.score}%</p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No submissions yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
