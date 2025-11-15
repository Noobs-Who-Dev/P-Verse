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

            // Check if page was refreshed (not a new tab/window)
            const wasRefreshed = sessionStorage.getItem('pageRefreshed');

            // Check sessionStorage first (per-tab storage)
            const sessionToken = sessionStorage.getItem('token');
            const sessionUser = sessionStorage.getItem('user');

            // Check localStorage as backup (for refresh scenario)
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const loginTime = localStorage.getItem('loginTime');

            console.log('[AuthProvider] Storage check:', {
                hasSessionToken: !!sessionToken,
                hasSessionUser: !!sessionUser,
                hasLocalStorageToken: !!storedToken,
                wasRefreshed: !!wasRefreshed
            });

            // Scenario 1: Fresh tab/window (not refresh)
            // → No sessionStorage, but might have localStorage from previous session
            // → Should LOGOUT (redirect to login)
            if (!sessionToken && !wasRefreshed) {
                console.log('[AuthProvider] New tab/window detected - logout required');
                // Clear all auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('loginTime');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                document.cookie = 'auth-token=; path=/; max-age=0';

                setUser(null);
                setToken(null);
                setIsLoading(false);
                console.log('[AuthProvider] Not authenticated - will redirect to login');
                return;
            }

            // Scenario 2: Page refresh (F5)
            // → wasRefreshed flag exists, restore from localStorage
            if (wasRefreshed && !sessionToken && storedToken && storedUser && loginTime) {
                console.log('[AuthProvider] Page refreshed - restoring session');

                try {
                    const parsedUser = JSON.parse(storedUser);
                    const loginTimestamp = parseInt(loginTime);
                    const tokenAge = Date.now() - loginTimestamp;
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

                    if (tokenAge < maxAge) {
                        // Token still valid → Restore session
                        setToken(storedToken);
                        setUser(parsedUser);

                        // Restore to sessionStorage (for this tab)
                        sessionStorage.setItem('token', storedToken);
                        sessionStorage.setItem('user', storedUser);

                        console.log('[AuthProvider] Session restored from localStorage');
                    } else {
                        // Token expired
                        console.log('[AuthProvider] Token expired, clearing session');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('loginTime');
                        setUser(null);
                        setToken(null);
                    }
                } catch (error) {
                    console.error('[AuthProvider] Error restoring session:', error);
                    setUser(null);
                    setToken(null);
                }
            }
            // Scenario 3: Has sessionStorage (same tab, navigating)
            else if (sessionToken && sessionUser) {
                console.log('[AuthProvider] Session active in current tab');
                try {
                    const parsedUser = JSON.parse(sessionUser);
                    setToken(sessionToken);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('[AuthProvider] Error parsing session data:', error);
                    setUser(null);
                    setToken(null);
                }
            }

            setIsLoading(false);
            console.log('[AuthProvider] Initialization complete');
        };

        initAuth();

        // Mark that page has been loaded (for refresh detection)
        sessionStorage.setItem('pageRefreshed', 'true');

        // Clean up refresh flag on unload (when tab closes or navigates away)
        const handleBeforeUnload = () => {
            // Don't remove the flag - it will be auto-cleared when tab closes
            // This allows refresh detection to work
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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

        const userData = { id: userId, username: userName, email, displayName, avatarUrl };
        const userDataString = JSON.stringify(userData);
        const loginTime = Date.now();

        // Lưu vào localStorage (backup for refresh)
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', userDataString);
        localStorage.setItem('loginTime', loginTime.toString());

        // Lưu vào sessionStorage (primary storage - cleared when tab closes)
        sessionStorage.setItem('token', accessToken);
        sessionStorage.setItem('user', userDataString);
        sessionStorage.setItem('pageRefreshed', 'true'); // Mark as active session

        // Lưu vào cookie
        document.cookie = `auth-token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

        // Lưu vào state
        setToken(accessToken);
        setUser(userData);

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

        const userData = { id: userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl };
        const userDataString = JSON.stringify(userData);
        const loginTime = Date.now();

        // Lưu vào localStorage (backup for refresh)
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', userDataString);
        localStorage.setItem('loginTime', loginTime.toString());

        // Lưu vào sessionStorage (primary storage - cleared when tab closes)
        sessionStorage.setItem('token', accessToken);
        sessionStorage.setItem('user', userDataString);
        sessionStorage.setItem('pageRefreshed', 'true'); // Mark as active session

        // Lưu vào cookie
        document.cookie = `auth-token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

        // Auto login - Set state
        setToken(accessToken);
        setUser(userData);

        console.log('[AuthProvider] Registration successful at:', new Date(loginTime).toISOString());

        router.push('/');
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');

        // Clear sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('pageRefreshed');

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