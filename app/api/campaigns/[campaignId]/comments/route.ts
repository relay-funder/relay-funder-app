import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiRateLimitError,
  ApiAuthNotAllowed,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { addCampaignComment, getCampaign } from '@/lib/api/campaigns';
import { checkAbusiveContent, listComments } from '@/lib/api/comment';
import { getUser, getUserNameFromInstance } from '@/lib/api/user';
import { notify } from '@/lib/api/event-feed';

const MAX_COMMENT_LENGTH = 1000;

// seconds for the same user commenting on the same campaign
const MIN_TIME_BETWEEN_POSTS =
  process.env.NODE_ENV === 'development' ? 10 : 500;

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
      // Only campaign owners and admins can access comments for non-active campaigns
      if (instance.creatorAddress !== session.user.address && !admin) {
        throw new ApiNotFoundError('Campaign not found');
      }
    }

    return response(
      await listComments({
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
export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    const { content } = await req.json();
    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    if (typeof content !== 'string' || !content.trim().length) {
      throw new ApiParameterError('content is required');
    }
    if (content.trim().length > MAX_COMMENT_LENGTH) {
      throw new ApiParameterError('content length exceeded');
    }
    // Get campaign info from database
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    const creator = await getUser(campaign.creatorAddress);
    if (!creator) {
      throw new ApiNotFoundError('Campaign Creator not found');
    }

    // basic rate limiting
    const lastUserComment = await db.comment.findFirst({
      where: { campaignId, userAddress: session.user.address },
      orderBy: { createdAt: 'desc' },
    });
    if (
      Date.now() - (lastUserComment?.createdAt?.getTime() ?? 0) <
      1000 * MIN_TIME_BETWEEN_POSTS
    ) {
      throw new ApiRateLimitError('Too many comments');
    }
    await checkAbusiveContent(content);
    addCampaignComment(campaignId, content, session.user.address);
    const userName = getUserNameFromInstance(user) || user.address || 'unknown';
    await notify({
      receiverId: creator.id,
      creatorId: user.id,
      data: {
        type: 'CampaignComment',
        campaignId,
        campaignTitle: campaign.title,
        action: 'posted',
        userName,
        comment: content,
      },
    });

    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
export async function DELETE(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    const { commentId }: { commentId: number } = await req.json();
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
    const creator = await getUser(campaign.creatorAddress);
    if (!creator) {
      throw new ApiNotFoundError('Campaign Creator not found');
    }
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new ApiNotFoundError('Comment not found');
    }
    let canDelete = false;
    let notifyCreator = true;
    if (session.user.address === comment.userAddress) {
      // a user may delete their own comment
      canDelete = true;
    }
    if (session.user.address === campaign.creatorAddress) {
      // a campaign user may delete any comment in the campaign
      canDelete = true;
      notifyCreator = false;
    }
    if (await isAdmin()) {
      // a admin may delete any comment
      canDelete = true;
    }
    if (!canDelete) {
      throw new ApiAuthNotAllowed('Not allowed to remove this comment');
    }
    await db.comment.delete({ where: { id: commentId } });
    if (notifyCreator) {
      const userName =
        getUserNameFromInstance(user) || user.address || 'unknown';
      await notify({
        receiverId: creator.id,
        creatorId: user.id,
        data: {
          type: 'CampaignComment',
          campaignId,
          campaignTitle: campaign.title,
          action: 'deleted',
          userName,
          comment: comment.content,
        },
      });
    }
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
