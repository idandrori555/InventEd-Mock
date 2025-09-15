import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, startLesson } from '@/lib/api';
import type { Task } from 'common/types';

interface Props {
    groupId: number;
    onClose: () => void;
}

export default function StartLessonFromGroupModal({ groupId, onClose }: Props) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleTaskSelection = (taskId: number) => {
        setSelectedTaskIds(prev => 
            prev.includes(taskId) 
                ? prev.filter(id => id !== taskId) 
                : [...prev, taskId]
        );
    };

    const handleStartLesson = async () => {
        if (selectedTaskIds.length === 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const newLesson = await startLesson({ groupId, taskIds: selectedTaskIds });
            alert(`Lesson started! ID: ${newLesson.id}`);
            navigate(`/teacher/lessons/${newLesson.id}/analytics`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Start a New Lesson</h3>
                    <div className="mt-4 px-2 py-3 h-64 overflow-y-auto">
                        <h4 className="font-semibold mb-2">Select Tasks to Include:</h4>
                        {loading && <p>Loading tasks...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && (
                            <div className="space-y-2">
                                {tasks.map(task => (
                                    <label key={task.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedTaskIds.includes(task.id)}
                                            onChange={() => handleTaskSelection(task.id)}
                                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-800 font-medium">{task.title}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="items-center px-4 py-3 space-y-2">
                        <button
                            onClick={handleStartLesson}
                            disabled={selectedTaskIds.length === 0 || isSubmitting}
                            className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Starting...' : 'Confirm and Start Lesson'}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
