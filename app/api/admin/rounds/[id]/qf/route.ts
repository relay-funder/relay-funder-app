import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { getRoundQfDistribution } from '@/lib/api/qf';
import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';

export async function GET(req: Request, { params }: RoundsWithIdParams) {
  try {
    await checkAuth(['admin']);
    const { id } = await params;
    const roundId = Number(id);
    if (!Number.isInteger(roundId)) {
      throw new ApiParameterError('Invalid round id');
    }
    const { distribution, totalAllocated } =
      await getRoundQfDistribution(roundId);

    return response({ distribution, totalAllocated });
  } catch (error: unknown) {
    return handleError(error);
  }
}
