// ABOUTME: Button component to trigger passport verification or refresh score.
// ABOUTME: Supports compact mode for inline usage with loading states.

'use client';

import { Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { usePassportScore } from '@/lib/hooks/usePassportScore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface VerifyButtonProps {
  compact?: boolean;
}

export function VerifyButton({ compact = false }: VerifyButtonProps) {
  const {
    data: verificationData,
    isFetching,
    isPending,
    refetch,
  } = usePassportScore();

  const isLoading = isFetching || isPending;

  // Note: this success comes from the passport score response
  // so it's the verification set by the Scorer with id -> PASSPORT_SCORER_ID
  // if we wanna easily change it through env variables,
  // we can validate based on comparing the verificationData.passportScore with a set value in the envs
  const hasBeenVerified = verificationData?.success === true;

  const verifyPassport = () => {
    refetch();
  };

  if (compact) {
    return (
      <Button
        variant="outline"
        onClick={verifyPassport}
        disabled={isLoading}
        aria-label="Verify passport"
        aria-busy={isLoading}
      >
        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
      </Button>
    );
  }

  return (
    <Button onClick={verifyPassport} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {hasBeenVerified ? 'Refresh Score' : 'Verify Passport'}
        </>
      )}
    </Button>
  );
}
