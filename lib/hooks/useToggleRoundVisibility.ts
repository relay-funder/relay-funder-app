import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ROUNDS_QUERY_KEY, ROUND_QUERY_KEY } from './useRounds';

interface ToggleRoundVisibilityInput {
  roundId: number;
  isHidden: boolean;
}

async function toggleRoundVisibility({
  roundId,
  isHidden,
}: ToggleRoundVisibilityInput) {
  const response = await fetch(`/api/admin/rounds/${roundId}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isHidden }),
  });

  if (!response.ok) {
    let message = 'Failed to update round visibility';
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export function useToggleRoundVisibility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: toggleRoundVisibility,
    onSuccess: (_data, variables) => {
      // Invalidate all round queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ROUND_QUERY_KEY, variables.roundId],
      });

      // Show success toast
      toast({
        title: variables.isHidden ? 'Round Hidden' : 'Round Made Public',
        description: variables.isHidden
          ? 'The round is now hidden from public view.'
          : 'The round is now visible to the public.',
        variant: 'default',
      });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: 'Failed to Update Round Visibility',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
}
