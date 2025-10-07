import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';
import { getRoundQFDistribution } from '@/lib/qf-calculation';
import { debugApi as debug } from '@/lib/debug';
import { ApiParameterError } from '@/lib/api/error';

export async function GET(req: Request, { params }: RoundsWithIdParams) {
  const rawId = (await params).id;
  try {
    const id = Number(rawId);
    if (!Number.isInteger(id)) {
      throw new ApiParameterError('Invalid round id');
    }
    debug && console.log(`Starting QF calculation for round ${id}...`);
    const { distribution, totalAllocated } = await getRoundQFDistribution(id);
    debug &&
      Object.entries(distribution).forEach(
        ([id, { title, matchingAmount }]) => {
          console.log(`${id}: ${title} - ${matchingAmount}`);
        },
      );
    debug && console.log(`Total allocated: ${totalAllocated}`);
    return response({ distribution, totalAllocated });
  } catch (error: unknown) {
    debug && console.error(`QF calculation failed for round ${rawId}:`, error);
    return handleError(error);
  }
}
