import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGroup } from '@/lib/api';
import type { Group, User } from 'common/types';

interface GroupDetails extends Group {
    students: User[];
}

export default function TeacherGroupDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchGroup = async () => {
            try {
                const fetchedGroup = await getGroup(Number(id));
                setGroup(fetchedGroup);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [id]);

    if (loading) return <div className="text-center p-4">Loading group details...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    if (!group) return <div className="text-center p-4">Group not found.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{group.name}</h1>
            
            <h2 className="text-2xl font-semibold mb-4">Enrolled Students</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {group.students.length > 0 ? (
                        group.students.map((student) => (
                            <li key={student.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <p className="text-lg font-medium text-gray-800">{student.name}</p>
                                    <p className="text-sm text-gray-500">Personal ID: {student.personalId}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No students are enrolled in this group.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
