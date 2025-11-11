'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user từ localStorage/cookie khi app start
    useEffect(() => {
        const initAuth = () => {
            console.log('[AuthProvider] Initializing auth...');

            // Check if this is a fresh session (no sessionStorage flag)
            const isActiveSession = sessionStorage.getItem('activeSession');

            if (!isActiveSession) {
                // This is a new session (fresh browser/tab start)
                console.log('[AuthProvider] New session detected, clearing old data');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('loginTime');
                document.cookie = 'auth-token=; path=/; max-age=0';
                setIsLoading(false);
                console.log('[AuthProvider] Initialization complete - fresh start');
                return;
            }

            // Check localStorage
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const loginTime = localStorage.getItem('loginTime');

            // Check cookie
            const cookieToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            console.log('[AuthProvider] Auth data found:', {
                hasLocalStorageToken: !!storedToken,
                hasLocalStorageUser: !!storedUser,
                hasCookie: !!cookieToken,
                hasLoginTime: !!loginTime,
                isActiveSession: !!isActiveSession
            });

            if (storedToken && storedUser && loginTime) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    const loginTimestamp = parseInt(loginTime);
                    const currentTime = Date.now();
                    const tokenAge = currentTime - loginTimestamp;
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

                    console.log('[AuthProvider] Token age:', {
                        loginTimestamp: new Date(loginTimestamp).toISOString(),
                        currentTime: new Date(currentTime).toISOString(),
                        ageInHours: (tokenAge / (60 * 60 * 1000)).toFixed(2),
                        maxAgeInHours: 24
                    });

                    // Check if token is still fresh (within 24 hours)
                    if (tokenAge < maxAge) {
                        // Token is fresh, restore session
                        setToken(storedToken);
                        setUser(parsedUser);

                        // Sync cookie if missing
                        if (!cookieToken) {
                            document.cookie = `auth-token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
                        }

                        console.log('[AuthProvider] Token is fresh, user restored:', parsedUser.username);
                    } else {
                        // Token is too old, clear session
                        console.log('[AuthProvider] Token expired (older than 24h), clearing session');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('loginTime');
                        document.cookie = 'auth-token=; path=/; max-age=0';
                    }
                } catch (error) {
                    console.error('[AuthProvider] Error during auth initialization:', error);
                    // Clear corrupted data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('loginTime');
                    document.cookie = 'auth-token=; path=/; max-age=0';
                }
            } else {
                console.log('[AuthProvider] No authenticated user found or missing loginTime');
                // Clear partial data
                if (storedToken || storedUser || loginTime) {
                    console.log('[AuthProvider] Clearing incomplete session data');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('loginTime');
                    document.cookie = 'auth-token=; path=/; max-age=0';
                }
            }

            setIsLoading(false);
            console.log('[AuthProvider] Initialization complete');
        };

        initAuth();

        // Set active session flag
        sessionStorage.setItem('activeSession', 'true');

        // No need for beforeunload event - sessionStorage auto-clears on tab/window close
    }, []);

    const login = async (username: string, password: string) => {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        const { accessToken, userId, username: userName, email, displayName, avatarUrl } = data.data;

        // Lưu vào state
        setToken(accessToken);
        setUser({ id: userId, username: userName, email, displayName, avatarUrl });

        // Lưu vào localStorage với timestamp
        const loginTime = Date.now();
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify({ id: userId, username: userName, email, displayName, avatarUrl }));
        localStorage.setItem('loginTime', loginTime.toString());

        // Lưu vào cookie để middleware có thể check
        document.cookie = `auth-token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

        console.log('[AuthProvider] Login successful at:', new Date(loginTime).toISOString());

        // Redirect
        router.push('/');
    };

    const register = async (username: string, email: string, password: string, displayName?: string) => {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, displayName }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        const { accessToken, userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl } = data.data;

        // Auto login
        setToken(accessToken);
        setUser({ id: userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl });

        // Lưu vào localStorage với timestamp
        const loginTime = Date.now();
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify({ id: userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl }));
        localStorage.setItem('loginTime', loginTime.toString());

        // Lưu vào cookie
        document.cookie = `auth-token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

        console.log('[AuthProvider] Registration successful at:', new Date(loginTime).toISOString());

        router.push('/');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');

        // Xóa cookie
        document.cookie = 'auth-token=; path=/; max-age=0';

        console.log('[AuthProvider] Logout, redirecting to /login');
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: !!token,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}