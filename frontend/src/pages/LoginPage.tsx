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
            if (role === 'teacher') {
                navigate('/teacher/groups');
            } else {
                navigate('/student/groups');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleButtonClasses = (isActive: boolean) => 
        `w-1/2 py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-colors duration-150 ` +
        (isActive 
            ? 'bg-white shadow text-indigo-700' 
            : 'text-gray-600 hover:bg-white/50 hover:text-gray-800');

    return (
        <div className="flex items-center justify-center min-h-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    {/* Placeholder for a logo */}
                    <div className="mx-auto h-12 w-12 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to InventEd
                    </h2>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="personalId" className="sr-only">Personal ID</label>
                            <input
                                id="personalId"
                                name="personalId"
                                type="text"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter your Personal ID (e.g., T01, S01)"
                                value={personalId}
                                onChange={(e) => setPersonalId(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex space-x-1 rounded-lg bg-slate-100 p-1">
                                <button type="button" onClick={() => setRole('student')} className={roleButtonClasses(role === 'student')}>
                                    Student
                                </button>
                                <button type="button" onClick={() => setRole('teacher')} className={roleButtonClasses(role === 'teacher')}>
                                    Teacher
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-center text-red-600">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                            >
                                {isSubmitting ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

