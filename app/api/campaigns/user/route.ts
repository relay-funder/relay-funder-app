import { checkAuth, isAdmin } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { listCampaigns } from '@/lib/api/campaigns';
import { ApiParameterError } from '@/lib/api/error';

export async function GET(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const rounds =
      (searchParams.get('rounds') || 'false') === 'true' ? true : false;
    const syncChain = searchParams.get('sync-chain') || 'false';
    const skip = (page - 1) * pageSize;
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }
    const forceEvents = syncChain === 'true' ? true : false;
    // status active should be enforced if access-token is not admin
    const admin = await isAdmin();
    return response(
      await listCampaigns({
        creatorAddress: session.user.address,
        admin,
        status,
        page,
        pageSize,
        rounds,
        skip,
        forceEvents,
      }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
