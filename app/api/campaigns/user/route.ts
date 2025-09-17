import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { getCampaign, listCampaigns } from '@/lib/api/campaigns';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
  ApiUpstreamError,
} from '@/lib/api/error';
import { PatchUserCampaignResponse } from '@/lib/api/types';
import { fileToUrl } from '@/lib/storage';
import { getUser } from '@/lib/api/user';

export async function GET(req: Request) {
  try {
    const session = await checkAuth(['user']);
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
        creatorAddress: session.user.address,
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

export async function PATCH(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const asAdmin = await isAdmin();
    const formData = await req.formData();

    // Extract form fields
    const campaignId = formData.get('campaignId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const location = formData.get('location') as string;
    const category = formData.get('category') as string;
    const bannerImage = formData.get('bannerImage') as File | null;

    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    if (!title || !description) {
      throw new ApiParameterError('missing required fields');
    }
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
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
    await db.campaign.update({
      where: {
        id: instance.id,
      },
      data: {
        title,
        description,
        location,
        category,
      },
    });
    if (imageUrl) {
      const campaignMedia = await db.media.findMany({
        where: { campaignId: instance.id },
      });
      const media = await db.media.create({
        data: {
          url: imageUrl,
          mimeType,
          state: 'UPLOADED',
          campaign: { connect: { id: instance.id } },
          createdBy: { connect: { id: user.id } },
        },
      });
      await db.campaign.update({
        where: { id: instance.id },
        data: {
          mediaOrder: [media.id, ...campaignMedia.map(({ id }) => id)],
        },
      });
    }

    return response({
      campaign: await getCampaign(instance.id),
    } as PatchUserCampaignResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
