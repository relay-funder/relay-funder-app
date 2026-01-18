// ABOUTME: Hook for handling auth errors with user-friendly toast and sign-in action
// ABOUTME: Shows "Session expired" message with a button to re-authenticate

'use client';

import { useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { ApiAuthError, ApiAuthNotAllowed } from '@/lib/api/error';

/**
 * Check if an error is an authentication error (401), not an authorization error (403).
 * ApiAuthNotAllowed extends ApiAuthError, so we must explicitly exclude it.
 */
export function isAuthError(error: unknown): boolean {
  // Exclude authorization errors (403) - user is authenticated but not permitted
  if (error instanceof ApiAuthNotAllowed) {
    return false;
  }
  // Only true authentication errors (401) - session expired
  if (error instanceof ApiAuthError) {
    return true;
  }
  if (error instanceof Error && error.name === 'AuthError') {
    return true;
  }
  return false;
}

/**
 * Hook that provides auth-aware error handling
 * Shows a specific toast for session expiration with a "Sign in" button
 */
export function useAuthErrorHandler() {
  const { toast } = useToast();

  /**
   * Handle an error, showing appropriate toast based on error type
   * Returns true if error was an auth error (so caller can skip generic handling)
   */
  const handleError = useCallback(
    (error: unknown, fallbackMessage: string = 'An error occurred'): boolean => {
      if (isAuthError(error)) {
        toast({
          title: 'Session expired',
          description: 'Your session has expired. Please sign in again to continue.',
          variant: 'destructive',
          action: (
            <ToastAction altText="Sign in" onClick={() => signIn()}>
              Sign in
            </ToastAction>
          ),
        });
        return true;
      }

      // Not an auth error - show generic toast
      const message = error instanceof Error ? error.message : fallbackMessage;
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    },
    [toast],
  );

  /**
   * Show auth error toast specifically (when you know it's an auth error)
   */
  const showAuthError = useCallback(() => {
    toast({
      title: 'Session expired',
      description: 'Your session has expired. Please sign in again to continue.',
      variant: 'destructive',
      action: (
        <ToastAction altText="Sign in" onClick={() => signIn()}>
          Sign in
        </ToastAction>
      ),
    });
  }, [toast]);

  return {
    handleError,
    showAuthError,
    isAuthError,
  };
}
