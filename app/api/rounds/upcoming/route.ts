import { db } from '@/server/db';
import { response, handleError } from '@/lib/api/response';
import { mapRound } from '@/lib/api/rounds';

export async function GET() {
  try {
    // Find the next upcoming round (earliest round that hasn't started yet)
    const now = new Date();
    const upcomingRound = await db.round.findFirst({
      where: {
        isHidden: false, // Exclude hidden rounds
        startDate: {
          gt: now, // Round hasn't started yet
        },
      },
      include: {
        media: { where: { state: 'UPLOADED' } },
        _count: {
          select: {
            roundCampaigns: {
              where: {
                status: 'APPROVED',
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc', // Get the earliest upcoming round
      },
    });

    if (!upcomingRound) {
      return response({ round: null });
    }

    return response({ round: mapRound(upcomingRound) });
  } catch (error: unknown) {
    return handleError(error);
  }
}
