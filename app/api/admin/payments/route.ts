import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { listAdminPayments } from '@/lib/api/adminPayments';

export async function GET(req: Request) {
  try {
    await checkAuth(['admin']);

    const { searchParams } = new URL(req.url);

    const page = Number.parseInt(searchParams.get('page') || '1');
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    if (Number.isNaN(page) || page < 1) {
      throw new ApiParameterError('Invalid page');
    }
    if (Number.isNaN(pageSize) || pageSize < 1) {
      throw new ApiParameterError('Invalid pageSize');
    }
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }

    // Optional filters
    const campaignIdParam = searchParams.get('campaignId');
    const userAddress = searchParams.get('userAddress') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const token = searchParams.get('token') ?? undefined;

    let campaignId: number | undefined = undefined;
    if (campaignIdParam !== null) {
      const parsed = Number.parseInt(campaignIdParam);
      if (Number.isNaN(parsed)) {
        throw new ApiParameterError('Invalid campaignId');
      }
      campaignId = parsed;
    }

    // Refund state filter (PaymentRefundState enum)
    const refundStateParam = searchParams.get('refundState');
    let refundState:
      | 'NONE'
      | 'REQUESTED'
      | 'PROCESSED'
      | 'APPROVED'
      | undefined = undefined;
    if (refundStateParam) {
      const upper = refundStateParam.toUpperCase();
      const allowed = ['NONE', 'REQUESTED', 'PROCESSED', 'APPROVED'] as const;
      if (!allowed.includes(upper as (typeof allowed)[number])) {
        throw new ApiParameterError(
          'Invalid refundState. Use NONE, REQUESTED, PROCESSED, or APPROVED.',
        );
      }
      refundState = upper as unknown as typeof refundState;
    }

    // Payment type filter (PaymentType enum)
    const typeParam = searchParams.get('type');
    let type: 'BUY' | 'SELL' | undefined = undefined;
    if (typeParam) {
      const upper = typeParam.toUpperCase();
      if (upper !== 'BUY' && upper !== 'SELL') {
        throw new ApiParameterError('Invalid type. Use BUY or SELL.');
      }
      type = upper as unknown as typeof type;
    }

    // Pledge execution status filter (PledgeExecutionStatus enum)
    const pledgeExecutionStatusParam = searchParams.get(
      'pledgeExecutionStatus',
    );
    let pledgeExecutionStatus:
      | 'NOT_STARTED'
      | 'PENDING'
      | 'SUCCESS'
      | 'FAILED'
      | undefined = undefined;
    if (pledgeExecutionStatusParam) {
      const upper = pledgeExecutionStatusParam.toUpperCase();
      const allowed = ['NOT_STARTED', 'PENDING', 'SUCCESS', 'FAILED'] as const;
      if (!allowed.includes(upper as (typeof allowed)[number])) {
        throw new ApiParameterError(
          'Invalid pledgeExecutionStatus. Use NOT_STARTED, PENDING, SUCCESS, or FAILED.',
        );
      }
      pledgeExecutionStatus = upper as unknown as typeof pledgeExecutionStatus;
    }

    const result = await listAdminPayments({
      page,
      pageSize,
      skip,
      campaignId,
      userAddress: userAddress || undefined,
      status: status || undefined,
      token: token || undefined,
      refundState,
      type,
      pledgeExecutionStatus,
    });

    return response(result);
  } catch (error: unknown) {
    return handleError(error);
  }
}
