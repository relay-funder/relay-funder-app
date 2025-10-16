import { response, handleError } from '@/lib/api/response';
import { getUpcomingRound, mapRound } from '@/lib/api/rounds';

export async function GET() {
  try {
    // Find the next upcoming round (earliest round that hasn't started yet)
    const upcomingRound = await getUpcomingRound();

    if (!upcomingRound) {
      return response({ round: null });
    }

    return response({ round: mapRound(upcomingRound) });
  } catch (error: unknown) {
    return handleError(error);
  }
}
