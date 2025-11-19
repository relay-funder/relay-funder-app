import { z } from 'zod';

import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { addCampaignUpdate } from '@/lib/api/campaigns';
import { notifyMany } from '@/lib/api/event-feed';
import { getUser } from '@/lib/api/user';
import { auth } from '@/server/auth';

const MAX_UPDATES_PAGE_SIZE = 10;

const CreateCampaignUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(120, { message: 'Title must be 120 characters or fewer' }),
  content: z
    .string()
    .trim()
    .min(1, { message: 'Content is required' })
    .max(5000, { message: 'Content must be 5000 characters or fewer' }),
});

async function getCampaignSummary(campaignId: number) {
  return db.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      slug: true,
      creatorAddress: true,
      title: true,
      status: true,
    },
  });
}

export async function GET(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const campaignId = parseInt((await params).campaignId, 10);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }

    const campaign = await getCampaignSummary(campaignId);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    const session = await auth();
    const isCreator = session?.user.address === campaign.creatorAddress;
    const isSessionAdmin = await isAdmin();

    // Check access control for non-active campaigns
    if (campaign.status !== 'ACTIVE') {
      // Only campaign owners and admins can access updates for non-active campaigns
      if (!isCreator && !isSessionAdmin) {
        throw new ApiAuthNotAllowed('Campaign not found');
      }
    }

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    if (Number.isNaN(page) || page < 1) {
      throw new ApiParameterError('page must be a positive integer');
    }
    if (Number.isNaN(pageSize) || pageSize < 1) {
      throw new ApiParameterError('pageSize must be a positive integer');
    }
    if (pageSize > MAX_UPDATES_PAGE_SIZE) {
      throw new ApiParameterError('Maximum page size exceeded');
    }

    const skip = (page - 1) * pageSize;

    const whereClause =
      isCreator || isSessionAdmin
        ? { campaignId }
        : { campaignId, isHidden: false };

    const [updates, totalCount] = await Promise.all([
      db.campaignUpdate.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { media: true },
      }),
      db.campaignUpdate.count({
        where: whereClause,
      }),
    ]);

    return response({
      updates: updates.map((update) =>
        isCreator || isSessionAdmin
          ? update
          : { ...update, isHidden: undefined },
      ),
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
        hasMore: skip + pageSize < totalCount,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('Admin user not found');
    }
    const campaignId = parseInt((await params).campaignId, 10);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }

    const campaign = await getCampaignSummary(campaignId);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (session.user.address !== campaign.creatorAddress) {
      throw new ApiAuthNotAllowed('Only the campaign creator can post updates');
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const mediaFiles = formData.getAll('media') as File[];

    const jsonData = { title, content };
    const parsed = CreateCampaignUpdateSchema.safeParse(jsonData);
    if (!parsed.success) {
      throw new ApiParameterError(
        'Invalid request body',
        parsed.error.flatten(),
      );
    }

    const createdUpdate = await addCampaignUpdate(
      campaign.id,
      parsed.data.title.trim(),
      parsed.data.content.trim(),
      mediaFiles,
      user.id,
    );

    const campaignContributors = await db.payment.findMany({
      where: {
        campaignId: campaign.id,
        refundState: 'NONE',
        isAnonymous: false,
      },
    });
    const campaignCommenterAddresses = await db.comment.findMany({
      where: {
        campaignId: campaign.id,
      },
      select: { userAddress: true },
    });
    const campaignFavoriteAddresses = await db.favorite.findMany({
      where: {
        campaignId: campaign.id,
      },
      select: { userAddress: true },
    });
    const campaignRelates = await db.user.findMany({
      where: {
        address: {
          in: [...campaignCommenterAddresses, ...campaignFavoriteAddresses]
            .map(({ userAddress }) => userAddress)
            .reduce((accumulator, address) => {
              if (
                typeof address !== 'string' ||
                !address.length ||
                accumulator.includes(address)
              ) {
                return accumulator;
              }
              return accumulator.concat(address);
            }, [] as string[]),
        },
      },
    });
    const receiverIds = [
      ...campaignRelates.map(({ id }) => id),
      ...campaignContributors.map(({ userId }) => userId),
    ].reduce((accumulator, id) => {
      if (accumulator.includes(id)) {
        return accumulator;
      }
      return accumulator.concat(id);
    }, [] as number[]);
    await notifyMany({
      receivers: receiverIds,
      creatorId: user.id,
      data: {
        type: 'CampaignUpdate',
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        updateText: content,
      },
    });

    return response({
      ok: true,
      update: createdUpdate,
    });
  } catch (error) {
    return handleError(error);
  }
}
