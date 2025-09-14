import { useState, useEffect } from 'react';
import { getGroups, createGroup } from '@/lib/api';
import type { Group } from 'common/types';

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createGroup(newGroupName);
      setNewGroupName('');
      await fetchGroups(); // Refetch groups after creating a new one
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading groups...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create New Group</h1>
        <form onSubmit={handleCreateGroup} className="flex items-center space-x-2 bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-6">My Groups</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {groups.length > 0 ? (
              groups.map((group) => (
                <li key={group.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <p className="text-lg font-medium text-indigo-600">{group.name}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No groups found. Create one to get started.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
