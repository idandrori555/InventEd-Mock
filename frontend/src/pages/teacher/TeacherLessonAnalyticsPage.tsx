import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLessonAnalytics, getLiveLessonData } from '@/lib/api';
import type { User } from 'common/types';

interface AnalyticsData {
  averageScore: number;
  submissions: { score: number; studentName: string }[];
  attendees: { id: number, studentName: string }[];
}

interface LiveData {
    attendees: User[];
    submitters: User[];
}

export default function TeacherLessonAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const analyticsData = await getLessonAnalytics(Number(id));
        setAnalytics(analyticsData);
        const liveData = await getLiveLessonData(Number(id));
        setLiveData(liveData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const interval = setInterval(async () => {
        try {
            const liveData = await getLiveLessonData(Number(id));
            setLiveData(liveData);
            // Optionally, refetch analytics to update scores
            const analyticsData = await getLessonAnalytics(Number(id));
            setAnalytics(analyticsData);
        } catch (err) {
            console.error("Error fetching live data:", err);
        }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading analytics...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!analytics) return <div className="text-center p-4">No analytics data found.</div>;

  const submittedIds = new Set(analytics.submissions.map(s => s.studentName));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Lesson Dashboard (Live)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">Class Average Score</h2>
            <p className="text-4xl font-bold text-indigo-600">{analytics.averageScore}%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">Attendance</h2>
            <p className="text-4xl font-bold text-indigo-600">{liveData?.attendees.length || 0} / {analytics.attendees.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">Submissions</h2>
            <p className="text-4xl font-bold text-indigo-600">{analytics.submissions.length} / {liveData?.attendees.length || 0}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h2 className="text-xl font-semibold mb-4">Participants</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {liveData?.attendees.map((student) => (
                        <li key={student.id} className="px-4 py-3 sm:px-6 flex justify-between items-center">
                            <p className="text-md font-medium text-gray-800">{student.name}</p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${submittedIds.has(student.name) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {submittedIds.has(student.name) ? 'Submitted' : 'Joined'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-4">Scores</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                {analytics.submissions.length > 0 ? (
                    analytics.submissions.map((sub, index) => (
                    <li key={index}>
                        <div className="px-4 py-3 sm:px-6 flex justify-between items-center">
                        <p className="text-md font-medium text-gray-800">{sub.studentName}</p>
                        <p className="text-md font-semibold text-gray-600">{sub.score}%</p>
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
      </div>
    </div>
  );
}
