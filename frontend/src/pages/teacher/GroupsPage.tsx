import { useState, useEffect } from 'react';
import { getGroups, createGroup } from '@/lib/api';
import type { Group } from 'common/types';

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [file, setFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !file || isSubmitting) {
        alert('Please provide a group name and select a file.');
        return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createGroup(newGroupName, file);
      setNewGroupName('');
      setFile(null);
      // Clear the file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

      await fetchGroups(); // Refetch groups after creating a new one
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && groups.length === 0) return <div className="text-center p-4">Loading groups...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create New Group</h1>
        <form onSubmit={handleCreateGroup} className="space-y-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">Group Name</label>
            <input
              type="text"
              id="group-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Grade 10 Math"
              className="mt-1 flex-grow w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Student List (.xlsx)
              <span className="text-xs text-gray-500 ml-2">(Columns: Name, PersonalID)</span>
            </label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Group from File'}
            </button>
          </div>
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
