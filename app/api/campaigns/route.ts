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
import { listCampaigns } from '@/lib/api/campaigns';

const statusMap: Record<string, CampaignStatus> = {
  draft: CampaignStatus.DRAFT,
  pending_approval: CampaignStatus.PENDING_APPROVAL,
  active: CampaignStatus.ACTIVE,
  completed: CampaignStatus.COMPLETED,
  failed: CampaignStatus.FAILED,
};
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  );

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured');
  }

  console.log('Uploading to Cloudinary with:', {
    cloudName,
    uploadPreset,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Cloudinary upload failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    throw new Error(`Cloudinary upload failed: ${errorData}`);
  }

  const data = await response.json();
  console.log('Cloudinary upload successful:', data);
  return data.secure_url;
}

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const creatorAddress = session.user.address;

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
    if (bannerImage) {
      try {
        imageUrl = await uploadToCloudinary(bannerImage);
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
        images: imageUrl
          ? {
              create: {
                imageUrl,
                isMainImage: true,
              },
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });

    console.log('Campaign created successfully:', campaign);

    return response({ campaignId: campaign.id });
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
    const campaign = await db.campaign.update({
      where: {
        id: instance.id,
      },
      data: {
        status,
        transactionHash,
        campaignAddress,
      },
    });

    return response(campaign);
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
