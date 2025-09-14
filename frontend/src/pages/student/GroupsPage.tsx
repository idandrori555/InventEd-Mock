import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroups } from '@/lib/api';
import type { Group } from 'common/types';

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroups = await getGroups();
        setGroups(fetchedGroups);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <div className="text-center p-4">Loading my groups...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Groups</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {groups.length > 0 ? (
            groups.map((group) => (
              <li key={group.id}>
                <Link to={`/student/groups/${group.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <p className="text-lg font-medium text-indigo-600">{group.name}</p>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              You are not assigned to any groups yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
