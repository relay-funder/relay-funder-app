import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiUpstreamError,
  ApiAuthNotAllowed,
  ApiNotFoundError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';

import { CampaignStatus } from '@/types/campaign';
import { getCampaign, listCampaigns } from '@/lib/api/campaigns';
import { PatchCampaignResponse, PostCampaignsResponse } from '@/lib/api/types';
import { fileToUrl } from '@/lib/storage';
import { debugApi as debug } from '@/lib/debug';
import { getUser } from '@/lib/api/user';

const statusMap: Record<string, CampaignStatus> = {
  draft: CampaignStatus.DRAFT,
  pending_approval: CampaignStatus.PENDING_APPROVAL,
  active: CampaignStatus.ACTIVE,
  completed: CampaignStatus.COMPLETED,
  failed: CampaignStatus.FAILED,
};

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const creatorAddress = session.user.address;
    const user = await getUser(creatorAddress);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    const formData = await req.formData();

    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const fundingGoal = formData.get('fundingGoal') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const statusRaw = formData.get('status') as string;

    const status = statusMap[statusRaw] || CampaignStatus.DRAFT;
    const location = formData.get('location') as string;
    const category = formData.get('category') as string;
    const bannerImage = formData.get('bannerImage') as File | null;

    debug &&
      console.log('Creating campaign with data:', {
        title,
        description,
        fundingGoal,
        startTime,
        endTime,
        creatorAddress,
        status,
        location,
      });

    if (
      !title ||
      !description ||
      !fundingGoal ||
      !startTime ||
      !endTime ||
      !creatorAddress
    ) {
      throw new ApiParameterError('missing required fields');
    }

    // Generate a unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSuffix = Date.now().toString(36);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    let imageUrl = null;
    let mimeType = 'application/octet-stream';
    if (bannerImage) {
      try {
        imageUrl = await fileToUrl(bannerImage);
        mimeType = bannerImage.type;
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        throw new ApiUpstreamError('Image upload failed');
      }
    }

    const campaign = await db.campaign.create({
      data: {
        title,
        description,
        fundingGoal,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creatorAddress,
        status,
        location: location || undefined,
        category: category || undefined,
        slug,
      },
    });
    if (imageUrl) {
      const media = await db.media.create({
        data: {
          url: imageUrl,
          mimeType,
          state: 'UPLOADED',
          campaign: { connect: { id: campaign.id } },
          createdBy: { connect: { id: user.id } },
        },
      });
      await db.campaign.update({
        where: { id: campaign.id },
        data: {
          mediaOrder: [media.id],
        },
      });
    }
    debug && console.log('Campaign created successfully:', campaign);

    return response({ campaignId: campaign.id } as PostCampaignsResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const asAdmin = await isAdmin();
    const body = await req.json();
    const {
      status: statusRaw,
      transactionHash,
      campaignAddress,
      campaignId,
    } = body;
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    const status = statusMap[statusRaw] || undefined;
    if (
      ![
        CampaignStatus.FAILED,
        CampaignStatus.PENDING_APPROVAL,
        CampaignStatus.DRAFT,
        undefined,
      ].includes(status)
    ) {
      // its only possible to set the whitelisted status to prevent api-calls that
      // make the campaign active.
      throw new ApiParameterError('Requested status update not allowed');
    }
    const instance = await db.campaign.findUnique({
      where: {
        id: parseInt(campaignId),
      },
    });
    if (!instance) {
      throw new ApiNotFoundError('Campaign not found');
    }
    if (instance.creatorAddress !== session?.user?.address && !asAdmin) {
      throw new ApiAuthNotAllowed('User cannot modify this campaign');
    }
    // Only update fields that changed; avoid unique constraint conflicts
    const data: Record<string, unknown> = {};
    if (typeof status !== 'undefined') data.status = status;
    if (transactionHash) data.transactionHash = transactionHash;
    // Only set campaignAddress if it's not already set or matches current
    if (
      campaignAddress &&
      (!instance.campaignAddress ||
        instance.campaignAddress === campaignAddress)
    ) {
      data.campaignAddress = campaignAddress;
    }

    if (Object.keys(data).length > 0) {
      try {
        await db.campaign.update({
          where: { id: instance.id },
          data,
        });
      } catch (e: unknown) {
        // Swallow unique constraint error on campaignAddress to prevent duplicate failures
        // Client can refetch; backend create-onchain already persisted values
        console.error('PATCH /api/campaigns update error', e);
      }
    }

    return response({
      campaign: await getCampaign(instance.id),
    } as PatchCampaignResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const rounds =
      (searchParams.get('rounds') || 'false') === 'true' ? true : false;
    const skip = (page - 1) * pageSize;
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }
    // status active should be enforced if access-token is not admin
    const admin = await isAdmin();
    return response(
      await listCampaigns({
        admin,
        status,
        page,
        pageSize,
        rounds,
        skip,
      }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
