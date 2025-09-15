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

    if (loading) return <div className="text-center p-4">Loading your lesson history...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Lesson History</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {history.length > 0 ? (
                        history.map((item) => (
                            <li key={item.lessonId}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-medium text-indigo-600 truncate">
                                            {item.taskTitle || 'Lesson'}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-lg leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {item.score}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                Completed on: {new Date(item.startTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            You have no completed lessons yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
