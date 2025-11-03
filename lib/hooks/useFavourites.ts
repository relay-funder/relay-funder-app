import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Favourite } from '@/types';
import { useAuth } from '@/contexts';
import { handleApiErrors } from '@/lib/api/error';

const FAVOURITE_QUERY_KEY = 'favourite';
const FAVOURITE_CHECK_QUERY_KEY = 'favourite_check';

async function fetchUserFavourites(): Promise<Favourite[]> {
  const response = await fetch(`/api/favorites/user`);
  await handleApiErrors(response, 'Failed to fetch user favourites');
  const data = await response.json();
  return data.favorites;
}
async function checkUserFavourite(campaignId: number): Promise<boolean> {
  const response = await fetch(`/api/favorites?campaignId=${campaignId}`);
  await handleApiErrors(response, 'Failed to fetch user favourites');

  const data = await response.json();
  return data.isFavorite ?? false;
}

export function useUserFavourites() {
  const { authenticated } = useAuth();
  return useQuery({
    queryKey: [FAVOURITE_QUERY_KEY, 'user'],
    queryFn: fetchUserFavourites,
    enabled: authenticated,
  });
}
export function useCheckUserFavourite(campaignId?: number | null) {
  const { authenticated } = useAuth();
  return useQuery({
    queryKey: [FAVOURITE_CHECK_QUERY_KEY, 'user', `${campaignId}`],
    queryFn: () => checkUserFavourite(campaignId!),
    enabled: authenticated,
  });
}

export function useUpdateFavourite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId }: { campaignId: number }) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
        }),
      });
      await handleApiErrors(response, 'Failed to update favourite');

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVOURITE_CHECK_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAVOURITE_QUERY_KEY] });
    },
  });
}
