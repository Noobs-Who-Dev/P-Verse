'use client';

import { useAuth } from '@/lib/auth/authContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">P-Verse</h1>

          <div className="flex items-center gap-4">
            <span>Welcome, {user?.displayName}</span>
            <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
  );
}