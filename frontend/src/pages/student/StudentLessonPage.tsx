import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTasksForLesson, markAttendance } from '@/lib/api';
import type { Task } from 'common/types';

export default function StudentLessonPage() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lessonId) return;

        const setupLesson = async () => {
            try {
                // Mark attendance automatically
                await markAttendance(Number(lessonId));

                // Fetch tasks for the lesson
                const fetchedTasks = await getTasksForLesson(Number(lessonId));
                setTasks(fetchedTasks);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        setupLesson();
    }, [lessonId]);

    if (loading) return <div className="text-center p-4">Joining lesson and fetching tasks...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Lesson Tasks</h1>
            <p className="text-gray-600 mb-8">Complete the following tasks for this lesson.</p>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <li key={task.id}>
                                <Link to={`/lessons/${lessonId}/task/${task.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-medium text-indigo-600 truncate">
                                                {task.title}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {task.questions.length} Questions
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">{task.description}</p>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No tasks have been assigned to this lesson yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
