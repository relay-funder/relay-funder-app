import { GetRoundResponseInstance } from '@/lib/api/types';
import { formatDistanceToNowStrict, isFuture, isPast } from 'date-fns';

export function useRoundTimeInfo(round: GetRoundResponseInstance) {
  const startDate = new Date(round.startTime);
  const endDate = new Date(round.endTime);
  if (
    !startDate ||
    !endDate ||
    !(startDate instanceof Date) ||
    isNaN(startDate.getTime()) ||
    !(endDate instanceof Date) ||
    isNaN(endDate.getTime())
  ) {
    return 'Date info unavailable';
  }

  if (isFuture(startDate)) {
    return `Starts in ${formatDistanceToNowStrict(startDate)}`;
  }
  if (isPast(endDate)) {
    return `Ended ${formatDistanceToNowStrict(endDate)} ago`;
  }
  return `Ends in ${formatDistanceToNowStrict(endDate)}`;
}
