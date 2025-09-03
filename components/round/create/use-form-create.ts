import { useCallback } from 'react';
import { CreateProcessStates } from '@/types/round';
import { useCreateRound } from '@/lib/hooks/useRounds';
import { useAuth } from '@/contexts';
import { RoundFormSchemaType } from './form';

export function useRoundFormCreate({
  onStateChanged,
  onError,
}: {
  onCreated?: () => void;
  onStateChanged: (arg0: keyof typeof CreateProcessStates) => void;
  onError: (arg0: string) => void;
}) {
  const { authenticated } = useAuth();

  const { mutateAsync: createRound } = useCreateRound();

  const mutateAsync = useCallback(
    async (data: RoundFormSchemaType) => {
      try {
        onStateChanged('setup');
        if (!authenticated) {
          throw new Error('Wallet not connected or contract not available');
        }
        onStateChanged('create');
        if (data.title.startsWith('QA:throw:createRound')) {
          throw new Error('Create round contract failure');
        }
        const newRound = await createRound(data);
        if (data.title.startsWith('QA:throw:createRoundContract')) {
          throw new Error('Create round contract failure');
        }
        onStateChanged('done');
        return newRound;
      } catch (error) {
        onStateChanged('failed');
        onError(
          `Failed to create round: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        );
      }
    },
    [authenticated, createRound, onError, onStateChanged],
  );
  return { mutateAsync };
}
