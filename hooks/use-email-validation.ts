import { useUserProfile } from '@/lib/hooks/useProfile';
import { useMemo } from 'react';

export interface EmailValidationResult {
  hasEmail: boolean;
  email?: string;
  isLoading: boolean;
  requiresEmail: boolean;
}

/**
 * Hook to validate if user has email before donation
 * Returns validation state and requirements
 */
export function useEmailValidation(): EmailValidationResult {
  const { data: profile, isLoading } = useUserProfile();

  return useMemo(() => {
    const hasEmail = Boolean(profile?.email?.trim());
    const requiresEmail = !hasEmail;

    return {
      hasEmail,
      email: profile?.email || undefined,
      isLoading,
      requiresEmail,
    };
  }, [profile?.email, isLoading]);
}
