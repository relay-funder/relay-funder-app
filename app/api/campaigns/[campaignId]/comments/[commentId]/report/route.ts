import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiAuthNotAllowed,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdWithCommentWithIdParams } from '@/lib/api/types';

export async function POST(
  req: Request,
  { params }: CampaignsWithIdWithCommentWithIdParams,
) {
  try {
    const session = await checkAuth(['user']);
    const campaignId = parseInt((await params).campaignId);
    const commentId = parseInt((await params).commentId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new ApiNotFoundError('Comment not found');
    }
    const admin = await isAdmin();
    if (comment.userAddress === session.user.address) {
      if (!admin) {
        throw new ApiAuthNotAllowed('Not allowed to report comment');
      }
    }
    if (
      typeof (comment as unknown as { reportCount: number })?.reportCount !==
      'number'
    ) {
      throw new ApiParameterError('schema not implemented');
    }
    await db.comment.update({
      where: { id: commentId },
      data: {
        // reportCount: { increment: 1 }
      },
    });
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
