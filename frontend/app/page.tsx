'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { InstagramLayout } from "@/components/instagram-layout";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  // Redirect to login if not authenticated - runs as soon as possible
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      console.log('[Home Page] Not authenticated, redirecting to /login');
      hasRedirected.current = true;

      // Use window.location for immediate, guaranteed redirect
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting message (very brief)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render main app layout only if authenticated
  return <InstagramLayout />;
}
