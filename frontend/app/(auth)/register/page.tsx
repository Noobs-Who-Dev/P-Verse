'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            console.log('[Login Page] Already authenticated, redirecting to /');
            router.push('/');
        }
    }, [authLoading, isAuthenticated, router]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        );
    }

    // Don't render if authenticated (redirect will happen)
    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            // Redirect được handle trong login function
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">P</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in to P-Verse</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Welcome back! Please enter your details.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign in'}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}