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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Create New Group</h1>
          <form onSubmit={handleCreateGroup} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-slate-600">Group Name</label>
              <input
                type="text"
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Grade 10 Math"
                className="mt-1 block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-600">
                Student List (.xlsx)
                <span className="text-xs text-slate-500 ml-2">(Columns: Name, PersonalID)</span>
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Creating...' : 'Create Group from File'}
              </button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-2">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">My Groups</h1>
          <div className="bg-white shadow-lg overflow-hidden rounded-xl">
            <ul role="list" className="divide-y divide-slate-200">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <li key={group.id} className="hover:bg-slate-50">
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <Link to={`/teacher/groups/${group.id}`} className="flex-grow">
                            <p className="text-md font-medium text-indigo-600">{group.name}</p>
                        </Link>
                        <button 
                            onClick={() => openStartLessonModal(group.id)}
                            className="ml-4 px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700"
                        >
                            Start Lesson
                        </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 sm:px-6 text-center text-slate-500">
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
