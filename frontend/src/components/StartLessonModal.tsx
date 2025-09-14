import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroups, startLesson } from '@/lib/api';
import type { Group } from 'common/types';

interface Props {
    taskId: number;
    onClose: () => void;
}

export default function StartLessonModal({ taskId, onClose }: Props) {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const fetchedGroups = await getGroups();
                setGroups(fetchedGroups);
                if (fetchedGroups.length > 0) {
                    setSelectedGroupId(fetchedGroups[0].id);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const handleStartLesson = async () => {
        if (!selectedGroupId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const newLesson = await startLesson({ groupId: selectedGroupId, taskId });
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
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Start a New Lesson</h3>
                    <div className="mt-2 px-7 py-3">
                        {loading && <p>Loading groups...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && (
                            <select
                                value={selectedGroupId || ''}
                                onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="items-center px-4 py-3">
                        <button
                            onClick={handleStartLesson}
                            disabled={!selectedGroupId || isSubmitting}
                            className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Starting...' : 'Confirm and Start'}
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
