'use client';

import { signIn } from 'next-auth/react';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Sentry } from '@/lib/sentry';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
    if (error.name === 'AuthError') {
      signIn();
      return;
    }
  }, [error]);

  const isServerError = useMemo(
    () => error?.digest || error.message?.includes('server'),
    [error],
  );
  const isAuthError = useMemo(() => error.name === 'AuthError', [error]);

  const errorTitle = useMemo(() => {
    if (isAuthError) return 'Session Expired';
    if (isServerError) return '500 - Server Error';
    return 'Something went wrong!';
  }, [isAuthError, isServerError]);

  // Set page title for browser history
  useMetaTitle(`${errorTitle} | Relay Funder`);

  const errorMessage = useMemo(() => {
    if (isAuthError) return 'Redirecting you to sign in...';
    if (isServerError) return 'Sorry, something went wrong on our server.';
    return error.message || 'An unexpected error occurred';
  }, [isAuthError, isServerError, error.message]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold">{errorTitle}</h1>
        <p className="mb-8 text-muted-foreground">{errorMessage}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
