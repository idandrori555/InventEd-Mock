import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [personalId, setPersonalId] = useState('');
    const [role, setRole] = useState<'teacher' | 'student'>('student');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await login(personalId, role);
            // Redirect after login
            if (role === 'teacher') {
                navigate('/teacher/groups');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-full">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div>
                    <h2 className="text-3xl font-extrabold text-center text-gray-900">
                        Sign in to InventEd
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="personalId" className="sr-only">Personal ID</label>
                            <input
                                id="personalId"
                                name="personalId"
                                type="text"
                                required
                                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your Personal ID (e.g., T01, S01)"
                                value={personalId}
                                onChange={(e) => setPersonalId(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-around">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={role === 'student'}
                                    onChange={() => setRole('student')}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span>Student</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="teacher"
                                    checked={role === 'teacher'}
                                    onChange={() => setRole('teacher')}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span>Teacher</span>
                            </label>
                        </div>
                    </div>

                    {error && <p className="text-sm text-center text-red-600">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
