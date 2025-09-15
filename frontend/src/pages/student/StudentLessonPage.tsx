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
                await markAttendance(Number(lessonId));
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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Lesson Tasks</h1>
            <p className="text-slate-600 mb-6">Complete the following tasks for this lesson.</p>
            <div className="bg-white shadow-lg overflow-hidden rounded-xl">
                <ul role="list" className="divide-y divide-slate-200">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <li key={task.id}>
                                <Link to={`/lessons/${lessonId}/task/${task.id}`} className="block hover:bg-slate-50 transition-colors duration-150">
                                    <div className="px-4 py-5 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-md font-semibold text-indigo-600 truncate">
                                                {task.title}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                    {task.questions.length} Questions
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{task.description}</p>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-6 sm:px-6 text-center text-slate-500">
                            No tasks have been assigned to this lesson yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
