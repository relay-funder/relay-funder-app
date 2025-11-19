import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiParameterError,
  ApiNotFoundError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';
import { listPayments } from '@/lib/api/payments';

export async function GET(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }
    const admin = await isAdmin();
    const instance = await getCampaign(campaignId);
    if (!instance) {
      throw new ApiNotFoundError('Campaign not found');
    }

    // Check access control for non-active campaigns
    if (instance.status !== 'ACTIVE') {
      // Only campaign owners and admins can access payments for non-active campaigns
      if (instance.creatorAddress !== session.user.address && !admin) {
        throw new ApiAuthNotAllowed('Campaign not found');
      }
    }

    return response(
      await listPayments({
        campaignId,
        admin,
        page,
        pageSize,
        skip,
      }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: CampaignsWithIdParams) {
  try {
    await checkAuth(['admin']);
    const { paymentId }: { paymentId: number } = await req.json();
    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    const payment = await db.payment.findUnique({
      where: { id: paymentId, campaignId },
    });
    if (!payment) {
      throw new ApiNotFoundError('Payment not found');
    }
    await db.payment.delete({ where: { id: paymentId } });

    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
