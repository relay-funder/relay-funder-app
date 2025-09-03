import { db } from '@/server/db';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';
import { checkAuth } from '@/lib/api/auth';
import { mapRound } from '@/lib/api/rounds';

export async function GET(req: Request, { params }: RoundsWithIdParams) {
  try {
    // public endpoint

    const id = (await params).id;

    const round = await db.round.findUnique({
      where: { id: Number(id) },
      include: {
        roundCampaigns: {
          include: { Campaign: true },
        },
      },
    });

    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }

    return response({ round: mapRound(round) });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: RoundsWithIdParams) {
  try {
    await checkAuth(['admin']);
    const roundId = parseInt((await params).id);
    if (!roundId) {
      throw new ApiParameterError('roundId is required');
    }
    const round = await db.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }

    await db.round.delete({ where: { id: roundId } });
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
