'use client';

import React from 'react';
import { useAuth } from '@/contexts';
import Authenticated from '@/components/login/authenticated';
import Login from '@/components/login';

export default function LoginPage() {
  const { authenticated, isReady } = useAuth();

  // Show loading state while authentication status is being determined
  if (!isReady) {
    return (
      <div className="flex w-full flex-col bg-gray-50">
        <main className="container mx-auto flex h-[calc(100vh-200px)] max-w-7xl items-center justify-center px-4 py-8">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm">Checking authentication status...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (authenticated) {
    return <Authenticated message="You are ready to contribute!" />;
  }

  return <Login />;
}
