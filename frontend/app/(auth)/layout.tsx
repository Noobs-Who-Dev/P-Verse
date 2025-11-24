'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Save theme preference to localStorage for later sync after login
        // This will be picked up by the auth context after successful login
        localStorage.setItem('preferredTheme', newTheme);

        console.log('[Auth Layout] Theme changed to:', newTheme, '(will sync to DB after login)');
    };

    return (
        <div className="relative">
            {/* Theme Toggle Button */}
            {mounted && (
                <button
                    onClick={toggleTheme}
                    className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 z-50 group"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-90 transition-transform duration-300" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-700 group-hover:rotate-12 transition-transform duration-300" />
                    )}
                </button>
            )}

            {children}
        </div>
    );
}

