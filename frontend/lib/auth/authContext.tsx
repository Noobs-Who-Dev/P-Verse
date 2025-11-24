'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { accountSwitcherService } from '@/lib/services/accountSwitcherService';

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
    switchAccount: (account: { id: number; username: string; displayName: string; email: string; avatarUrl?: string; token: string }) => Promise<void>;
    refreshUser: () => Promise<void>;
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

        // Save account to switcher service
        accountSwitcherService.saveAccount({
            id: userId,
            username: userName,
            displayName,
            email,
            avatarUrl,
            token: accessToken
        });

        console.log('[AuthProvider] Login successful at:', new Date(loginTime).toISOString());

        // Sync theme preference from login page to database
        try {
            const preferredTheme = localStorage.getItem('preferredTheme');
            if (preferredTheme) {
                console.log('[AuthProvider] Syncing theme preference to database:', preferredTheme);
                // Import settingsService dynamically to avoid circular dependency
                const { settingsService } = await import('@/app/(protected)/services/settingsService');
                await settingsService.updateTheme(userId, preferredTheme.toUpperCase());
                console.log('[AuthProvider] Theme synced successfully');
                // Clean up the preference flag
                localStorage.removeItem('preferredTheme');
            }
        } catch (error) {
            console.error('[AuthProvider] Failed to sync theme preference:', error);
            // Don't block login if theme sync fails
        }

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

        // Save account to switcher service
        accountSwitcherService.saveAccount({
            id: userId,
            username: userName,
            displayName: userDisplayName,
            email: userEmail,
            avatarUrl,
            token: accessToken
        });

        console.log('[AuthProvider] Registration successful at:', new Date(loginTime).toISOString());

        // Sync theme preference from register page to database
        try {
            const preferredTheme = localStorage.getItem('preferredTheme');
            if (preferredTheme) {
                console.log('[AuthProvider] Syncing theme preference to database:', preferredTheme);
                // Import settingsService dynamically to avoid circular dependency
                const { settingsService } = await import('@/app/(protected)/services/settingsService');
                await settingsService.updateTheme(userId, preferredTheme.toUpperCase());
                console.log('[AuthProvider] Theme synced successfully');
                // Clean up the preference flag
                localStorage.removeItem('preferredTheme');
            }
        } catch (error) {
            console.error('[AuthProvider] Failed to sync theme preference:', error);
            // Don't block registration if theme sync fails
        }

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

    const refreshUser = async () => {
        console.log('[AuthProvider] Refreshing user data...');

        if (!token || !user?.id) {
            console.warn('[AuthProvider] No token or user ID, cannot refresh');
            return;
        }

        try {
            // Fetch latest user data from server
            const response = await fetch('http://localhost:8080/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('[AuthProvider] Failed to refresh user data');
                return;
            }

            const result = await response.json();
            const updatedUserData = result.data;

            // Update user object with fresh data
            const freshUser = {
                id: updatedUserData.id,
                username: updatedUserData.username,
                email: updatedUserData.email,
                displayName: updatedUserData.displayName,
                avatarUrl: updatedUserData.avatarUrl,
            };

            const userDataString = JSON.stringify(freshUser);

            // Update all storage locations
            localStorage.setItem('user', userDataString);
            sessionStorage.setItem('user', userDataString);

            // Update state - this will trigger re-render of all components using useAuth
            setUser(freshUser);

            console.log('[AuthProvider] User data refreshed successfully', freshUser);
        } catch (error) {
            console.error('[AuthProvider] Error refreshing user data:', error);
        }
    };

    const switchAccount = async (account: { id: number; username: string; displayName: string; email: string; avatarUrl?: string; token: string }) => {
        console.log('[AuthProvider] Switching to account:', account.username);

        const userData = {
            id: account.id,
            username: account.username,
            email: account.email,
            displayName: account.displayName,
            avatarUrl: account.avatarUrl
        };
        const userDataString = JSON.stringify(userData);
        const loginTime = Date.now();

        // Update localStorage
        localStorage.setItem('token', account.token);
        localStorage.setItem('user', userDataString);
        localStorage.setItem('loginTime', loginTime.toString());

        // Update sessionStorage
        sessionStorage.setItem('token', account.token);
        sessionStorage.setItem('user', userDataString);
        sessionStorage.setItem('pageRefreshed', 'true');

        // Update cookie
        document.cookie = `auth-token=${account.token}; path=/; max-age=86400; SameSite=Lax`;

        // Update state
        setToken(account.token);
        setUser(userData);

        // Update current account ID in account switcher service
        localStorage.setItem('current_account_id', account.id.toString());

        console.log('[AuthProvider] Switched to account:', account.username);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                switchAccount,
                refreshUser,
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