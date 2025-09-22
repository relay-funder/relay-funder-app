import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { listWithdrawals } from '@/lib/api/withdrawals';

export async function GET(req: Request) {
  try {
    await checkAuth(['admin']);

    const { searchParams } = new URL(req.url);

    const page = Number.parseInt(searchParams.get('page') || '1');
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }

    // Optional filters
    const campaignIdParam = searchParams.get('campaignId');
    const createdByAddress = searchParams.get('createdByAddress') ?? undefined;
    const token = searchParams.get('token') ?? undefined;

    let campaignId: number | undefined = undefined;
    if (campaignIdParam !== null) {
      const parsed = Number.parseInt(campaignIdParam);
      if (Number.isNaN(parsed)) {
        throw new ApiParameterError('Invalid campaignId');
      }
      campaignId = parsed;
    }

    const statusParam = searchParams.get('status')?.toUpperCase();
    let status: 'APPROVED' | 'PENDING' | undefined = undefined;
    if (statusParam) {
      if (statusParam === 'APPROVED' || statusParam === 'PENDING') {
        status = statusParam;
      } else {
        throw new ApiParameterError('Invalid status. Use APPROVED or PENDING.');
      }
    }

    const result = await listWithdrawals({
      page,
      pageSize,
      skip,
      campaignId,
      createdByAddress,
      token,
      status,
    });

    return response(result);
  } catch (error: unknown) {
    return handleError(error);
  }
}
