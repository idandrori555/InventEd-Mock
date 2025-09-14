import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';

interface AuthUser {
    id: number;
    role: 'teacher' | 'student';
    name: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (personalId: string, role: 'teacher' | 'student') => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const decodedUser: AuthUser = jwtDecode(token);
                setUser(decodedUser);
            }
        } catch (error) {
            console.error("Invalid token", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (personalId: string, role: 'teacher' | 'student') => {
        const { token } = await apiLogin(personalId, role);
        localStorage.setItem('authToken', token);
        const decodedUser: AuthUser = jwtDecode(token);
        setUser(decodedUser);
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
