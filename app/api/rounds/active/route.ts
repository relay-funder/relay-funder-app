import { db } from '@/server/db';
import { response, handleError } from '@/lib/api/response';
import { mapRound } from '@/lib/api/rounds';

export async function GET() {
  try {
    // Find the latest active round based on date criteria only (matching the UI logic)
    // A round is "active" if: start date <= now < end date
    const now = new Date();
    const activeRound = await db.round.findFirst({
      where: {
        isHidden: false, // Exclude hidden rounds
        startDate: {
          lte: now, // Round has started
        },
        endDate: {
          gt: now, // Round hasn't ended
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
        createdAt: 'desc', // Get the latest active round
      },
    });

    if (!activeRound) {
      return response({ round: null });
    }

    return response({ round: mapRound(activeRound) });
  } catch (error: unknown) {
    return handleError(error);
  }
}
