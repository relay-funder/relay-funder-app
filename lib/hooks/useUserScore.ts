import { useAuth } from '@/contexts';
import { useQuery } from '@tanstack/react-query';

export const USER_SCORE_QUERY_KEY = 'user_score';

export type UserScore = {
  creatorScore: number;
  receiverScore: number;
  totalScore: number;
};

async function fetchUserScore(): Promise<UserScore> {
  const response = await fetch('/api/users/me/score');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user score');
  }
  return response.json();
}

export function useUserScore() {
  const { authenticated } = useAuth();
  return useQuery({
    queryKey: [USER_SCORE_QUERY_KEY],
    queryFn: fetchUserScore,
    enabled: authenticated,
  });
}
