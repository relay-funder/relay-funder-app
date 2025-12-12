'use client';

import { useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToggleRoundVisibility } from '@/lib/hooks/useToggleRoundVisibility';

export function RoundVisibilityToggle({
  roundId,
  isHidden,
}: {
  roundId: number | string;
  isHidden: boolean;
}) {
  const { mutateAsync: toggleVisibility, isPending: isToggling } =
    useToggleRoundVisibility();

  const handleToggleVisibility = useCallback(async () => {
    try {
      const numericRoundId =
        typeof roundId === 'number'
          ? roundId
          : parseInt(roundId as string, 10);

      if (
        !Number.isInteger(numericRoundId) ||
        numericRoundId <= 0 ||
        !Number.isFinite(numericRoundId)
      ) {
        throw new Error('Invalid round id: must be a positive integer');
      }

      await toggleVisibility({
        roundId: numericRoundId,
        isHidden: !isHidden,
      });
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to toggle round visibility:', error);
    }
  }, [roundId, isHidden, toggleVisibility]);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleToggleVisibility}
      disabled={isToggling}
      className="flex items-center gap-2"
    >
      {isHidden ? (
        <>
          <Eye className="h-4 w-4" />
          Show Round
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          Hide Round
        </>
      )}
    </Button>
  );
}
