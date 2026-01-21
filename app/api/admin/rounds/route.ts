import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
  ApiUpstreamError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { fileToUrl } from '@/lib/storage';
import { PatchRoundResponse, PostRoundsResponse } from '@/lib/api/types';
import { getUser } from '@/lib/api/user';
import { parseAndValidateRoundDates } from '@/lib/api/rounds/validate-round-dates';
import { z } from 'zod';

const RoundDatesFormSchema = z.object({
  applicationStartTime: z.string().min(1),
  applicationEndTime: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

/**
 * Zod schema for validating matchingPool form field.
 * Coerces string to number, ensures finite, non-negative value.
 * Decimals are allowed (matchingPool is Decimal in database).
 */
const MatchingPoolSchema = z.coerce
  .number({
    required_error: 'matchingPool is required',
    invalid_type_error: 'matchingPool must be a number',
  })
  .finite({ message: 'matchingPool must be a finite number' })
  .nonnegative({ message: 'matchingPool must be non-negative' });

/**
 * Parses and decodes comma-separated tags from form data.
 * Handles malformed percent-escapes by throwing ApiParameterError instead of letting URIError bubble.
 * @throws {ApiParameterError} if tag decoding fails
 */
function parseTags(value: string | null | undefined): string[] {
  const tags = (value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => {
      try {
        return decodeURIComponent(tag);
      } catch (error) {
        throw new ApiParameterError(
          `Invalid tags parameter: malformed percent-escaped sequence in tag "${tag}"`,
        );
      }
    });
  return tags;
}

/**
 * Strictly validates and parses a numeric string.
 * Ensures the value is a non-empty string containing only digits,
 * then converts to a finite number.
 * @throws {ApiParameterError} if validation fails
 */
function parseStrictNumeric(
  value: string | null | undefined,
  fieldName: string,
): number {
  const rawValue = value ?? '';
  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    throw new ApiParameterError(
      `Invalid ${fieldName}: must be a non-empty string`,
    );
  }
  if (!/^\d+$/.test(rawValue.trim())) {
    throw new ApiParameterError(
      `Invalid ${fieldName}: must contain only digits`,
    );
  }
  const parsed = Number(rawValue.trim());
  if (!Number.isFinite(parsed)) {
    throw new ApiParameterError(
      `Invalid ${fieldName}: must be a finite number`,
    );
  }
  return parsed;
}

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['admin']);
    const creatorAddress = session.user.address;
    const formData = await req.formData();
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const descriptionUrl = (formData.get('descriptionUrl') as string) || null;
    const matchingPoolResult = MatchingPoolSchema.safeParse(
      formData.get('matchingPool'),
    );
    if (!matchingPoolResult.success) {
      throw new ApiParameterError(
        `Invalid matchingPool: ${matchingPoolResult.error.errors[0]?.message ?? 'must be a valid non-negative number'}`,
      );
    }
    const matchingPool = matchingPoolResult.data;
    const rawDates = RoundDatesFormSchema.parse({
      applicationStartTime: formData.get('applicationStartTime'),
      applicationEndTime: formData.get('applicationEndTime'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
    });
    const { applicationStart, applicationEnd, roundStart, roundEnd } =
      parseAndValidateRoundDates(rawDates);
    const tags = parseTags(formData.get('tags') as string | null);
    const status = formData.get('status') as string;

    const logo = formData.get('logo') as File | null;

    // Check if any required fields are missing
    if (!title || !description) {
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
        descriptionUrl,
        tags,
        matchingPool: matchingPool,
        applicationStart,
        applicationClose: applicationEnd,
        startDate: roundStart,
        endDate: roundEnd,
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
    const id = parseStrictNumeric(formData.get('roundId') as string, 'roundId');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const matchingPoolResult = MatchingPoolSchema.safeParse(
      formData.get('matchingPool'),
    );
    if (!matchingPoolResult.success) {
      throw new ApiParameterError(
        `Invalid matchingPool: ${matchingPoolResult.error.errors[0]?.message ?? 'must be a valid non-negative number'}`,
      );
    }
    const matchingPool = matchingPoolResult.data;
    const rawDates = RoundDatesFormSchema.parse({
      applicationStartTime: formData.get('applicationStartTime'),
      applicationEndTime: formData.get('applicationEndTime'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
    });
    const { applicationStart, applicationEnd, roundStart, roundEnd } =
      parseAndValidateRoundDates(rawDates);
    const tags = parseTags(formData.get('tags') as string | null);
    const descriptionUrl = (formData.get('descriptionUrl') as string) || null;

    if (!title || !description) {
      throw new ApiParameterError('Missing required parameters');
    }

    const logo = formData.get('logo') as File | null;
    const instance = await db.round.findUnique({ where: { id } });
    if (!instance) {
      throw new ApiNotFoundError('Round not found');
    }
    if (!session.user.id) {
      throw new ApiNotFoundError('Invalid session user');
    }
    const user = await getUser(session.user.address);
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
        tags,
        matchingPool: matchingPool,
        startDate: roundStart,
        endDate: roundEnd,
        applicationStart,
        applicationClose: applicationEnd,
        logoUrl,
      },
    });
    if (logoUrl) {
      // For rounds, logo should be a single media item
      // Get the current mediaOrder to identify which media item to update
      const currentRound = await db.round.findUnique({
        where: { id },
        select: { mediaOrder: true },
      });

      let media;
      if (
        currentRound?.mediaOrder &&
        Array.isArray(currentRound.mediaOrder) &&
        currentRound.mediaOrder.length > 0
      ) {
        // Update the existing media item that's currently first in mediaOrder (used by UI)
        const mediaIdToUpdate = (currentRound.mediaOrder as string[])[0];
        media = await db.media.update({
          where: { id: mediaIdToUpdate },
          data: {
            url: logoUrl,
            mimeType,
            state: 'UPLOADED',
          },
        });
      } else {
        // No existing media, create new media entry for the logo
        media = await db.media.create({
          data: {
            url: logoUrl,
            mimeType,
            state: 'UPLOADED',
            round: { connect: { id } },
          },
        });
      }

      // Set mediaOrder to only contain the logo media
      await db.round.update({
        where: { id },
        data: {
          mediaOrder: [media.id],
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
