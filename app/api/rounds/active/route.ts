import { response, handleError } from '@/lib/api/response';
import { getActiveRound, mapRound } from '@/lib/api/rounds';

export async function GET() {
  try {
    // Find the latest active round based on date criteria only (matching the UI logic)
    // A round is "active" if: start date <= now < end date
    const activeRound = await getActiveRound();
    if (!activeRound) {
      return response({ round: null });
    }

    return response({ round: mapRound(activeRound) });
  } catch (error: unknown) {
    return handleError(error);
  }
}
