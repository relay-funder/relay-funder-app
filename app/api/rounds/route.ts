import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
  ApiUpstreamError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { listRounds } from '@/lib/api/rounds';
import { fileToUrl } from '@/lib/storage';
import { PatchRoundResponse, PostRoundsResponse } from '@/lib/api/types';
import { getUser } from '@/lib/api/user';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    const forceUserView = searchParams.get('forceUserView') === 'true';
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }

    // Check if user is admin to determine campaign filtering
    // If forceUserView is true, always use user-only mode regardless of admin status
    const admin = forceUserView ? false : await isAdmin();

    // Get current user's address for including their own campaigns
    let userAddress: string | null = null;
    try {
      const session = await checkAuth(['user']);
      userAddress = session.user.address;
    } catch {
      // User not authenticated, continue without user address
    }

    return response(
      await listRounds({ page, pageSize, skip, admin, userAddress }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['admin']);
    const creatorAddress = session.user.address;
    const formData = await req.formData();
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const matchingPool = parseInt(formData.get('matchingPool') as string);
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const applicationStartTime = formData.get('applicationStartTime') as string;
    const applicationEndTime = formData.get('applicationEndTime') as string;
    const tags =
      (formData.get('tags') as string)
        ?.split(',')
        .map((tag) => decodeURIComponent(tag)) ?? [];
    const status = formData.get('status') as string;

    const logo = formData.get('logo') as File | null;

    // Check if any required fields are missing
    if (
      !title ||
      !description ||
      !tags ||
      !matchingPool ||
      !applicationStartTime ||
      !applicationEndTime ||
      !startTime ||
      !endTime
    ) {
      throw new ApiParameterError('Missing required parameters');
    }

    // Validate status against enum values
    const validStatuses = ['NOT_STARTED', 'ACTIVE', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      throw new ApiParameterError('Invalid status value');
    }
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    let logoUrl = null;
    let mimeType = 'application/octet-stream';
    if (logo) {
      try {
        logoUrl = await fileToUrl(logo);
        mimeType = logo.type;
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        throw new ApiUpstreamError('Image upload failed');
      }
    }
    const newRound = await db.round.create({
      data: {
        title: title,
        description: description,
        tags,
        matchingPool: matchingPool,
        applicationStart: new Date(applicationStartTime),
        applicationClose: new Date(applicationEndTime),
        startDate: new Date(startTime),
        endDate: new Date(endTime),
        blockchain: 'CELO',
        logoUrl,
        managerAddress: creatorAddress,
      },
    });
    if (logoUrl) {
      const media = await db.media.create({
        data: {
          url: logoUrl,
          mimeType,
          state: 'UPLOADED',
          round: { connect: { id: newRound.id } },
          createdBy: { connect: { id: user.id } },
        },
      });
      await db.round.update({
        where: { id: newRound.id },
        data: {
          mediaOrder: [media.id],
        },
      });
    }
    const responseData: PostRoundsResponse = { roundId: newRound.id, logoUrl };
    return response(responseData);
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await checkAuth(['admin']);
    const formData = await req.formData();
    // Extract form fields
    const id = parseInt(formData.get('roundId') as string);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const matchingPool = parseInt(formData.get('matchingPool') as string);
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const applicationStartTime = formData.get('applicationStartTime') as string;
    const applicationEndTime = formData.get('applicationEndTime') as string;
    const tags = formData.get('tags') as string;
    const descriptionUrl = (formData.get('descriptionUrl') as string) || null;

    const logo = formData.get('logo') as File | null;
    const instance = await db.round.findUnique({ where: { id } });
    if (!instance) {
      throw new ApiNotFoundError('Round not found');
    }
    if (!session.user.id) {
      throw new ApiNotFoundError('Invalid session user');
    }
    const user = await getUser(session.user.id);
    if (!user?.featureFlags.includes('ROUND_MANAGER')) {
      if (instance.managerAddress !== session.user.address) {
        throw new ApiAuthNotAllowed(
          'Only the creator of the round may modify it',
        );
      }
    }
    let logoUrl = undefined;
    let mimeType = 'application/octet-stream';
    if (logo) {
      try {
        logoUrl = await fileToUrl(logo);
        mimeType = logo.type;
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        throw new ApiUpstreamError('Image upload failed');
      }
    }
    const updatedRound = await db.round.update({
      where: { id },
      data: {
        title,
        description,
        descriptionUrl,
        tags: tags.split(','),
        matchingPool: matchingPool,
        startDate: new Date(startTime),
        endDate: new Date(endTime),
        applicationStart: new Date(applicationStartTime),
        applicationClose: new Date(applicationEndTime),
        logoUrl,
      },
    });
    if (logoUrl) {
      const roundMedia = await db.media.findMany({ where: { roundId: id } });
      const media = await db.media.create({
        data: {
          url: logoUrl,
          mimeType,
          state: 'UPLOADED',
          round: { connect: { id } },
        },
      });
      await db.round.update({
        where: { id },
        data: {
          mediaOrder: [media.id, ...roundMedia.map(({ id }) => id)],
        },
      });
    }
    const responseData: PatchRoundResponse = {
      roundId: updatedRound.id,
      logoUrl: updatedRound.logoUrl,
    };
    return response(responseData);
  } catch (error: unknown) {
    return handleError(error);
  }
}
