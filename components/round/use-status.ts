import { GetRoundResponseInstance } from '@/lib/api/types';
import { isFuture, isPast } from 'date-fns';

export function useRoundStatus(round: GetRoundResponseInstance): {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (!round.startTime || !round.endTime)
    return { text: 'Invalid', variant: 'destructive' };
  if (isFuture(new Date(round.startTime))) {
    return { text: 'Upcoming', variant: 'secondary' };
  }
  if (isPast(new Date(round.endTime))) {
    return { text: 'Ended', variant: 'outline' };
  }
  return { text: 'Active', variant: 'default' };
}
