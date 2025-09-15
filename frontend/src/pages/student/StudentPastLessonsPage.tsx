import { useState, useEffect } from 'react';
import { getStudentLessonHistory } from '@/lib/api';

// Define a type for the history items for better type-safety
interface LessonHistoryItem {
    lessonId: number;
    startTime: string;
    score: number;
    taskTitle: string;
}

export default function StudentPastLessonsPage() {
    const [history, setHistory] = useState<LessonHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const fetchedHistory = await getStudentLessonHistory();
                setHistory(fetchedHistory);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-800';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

    if (loading) return <div className="text-center p-4">Loading your lesson history...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Lesson History</h1>
            <div className="bg-white shadow-lg overflow-hidden rounded-xl">
                <ul role="list" className="divide-y divide-slate-200">
                    {history.length > 0 ? (
                        history.map((item) => (
                            <li key={item.lessonId} className="hover:bg-slate-50">
                                <div className="px-4 py-5 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-md font-semibold text-indigo-600 truncate">
                                            {item.taskTitle || 'Lesson'}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(item.score)}`}>
                                                {item.score}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-slate-500">
                                                Completed on: {new Date(item.startTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-6 sm:px-6 text-center text-slate-500">
                            You have no completed lessons yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
