import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAuth(['admin']);
    const { id } = await params;
    const roundId = parseInt(id);

    if (!roundId || isNaN(roundId)) {
      throw new ApiParameterError('Invalid round ID');
    }

    const { isHidden } = await req.json();

    if (typeof isHidden !== 'boolean') {
      throw new ApiParameterError('isHidden must be a boolean');
    }

    // Check if round exists
    const existingRound = await db.round.findUnique({
      where: { id: roundId },
      select: { id: true, managerAddress: true },
    });

    if (!existingRound) {
      throw new ApiNotFoundError('Round not found');
    }

    // Update the round visibility
    const updatedRound = await db.round.update({
      where: { id: roundId },
      data: { isHidden },
      select: { id: true, isHidden: true },
    });

    return response({
      roundId: updatedRound.id,
      isHidden: updatedRound.isHidden,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
