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
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Groups</h1>
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link 
                key={group.id} 
                to={`/student/groups/${group.id}`} 
                className="bg-white p-6 shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
                <div>
                    <h3 className="text-lg font-semibold text-indigo-600 truncate">{group.name}</h3>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">View Group</p>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-700">No Groups Found</h2>
            <p className="mt-2 text-sm text-slate-500">You are not assigned to any groups yet.</p>
        </div>
      )}
    </div>
  );
}
