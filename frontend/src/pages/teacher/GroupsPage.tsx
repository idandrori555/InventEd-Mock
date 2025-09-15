import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroups, createGroup } from '@/lib/api';
import type { Group } from 'common/types';
import StartLessonFromGroupModal from '@/components/StartLessonFromGroupModal';

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

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
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

      await fetchGroups();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStartLessonModal = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroupId(null);
  };

  if (loading && groups.length === 0) return <div className="text-center p-4">Loading groups...</div>;

  return (
    <>
      {isModalOpen && selectedGroupId && (
        <StartLessonFromGroupModal groupId={selectedGroupId} onClose={handleCloseModal} />
      )}
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
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <Link to={`/teacher/groups/${group.id}`} className="block hover:bg-gray-50 flex-grow">
                            <p className="text-lg font-medium text-indigo-600">{group.name}</p>
                        </Link>
                        <button 
                            onClick={() => openStartLessonModal(group.id)}
                            className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            Start Lesson
                        </button>
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
    </>
  );
}
