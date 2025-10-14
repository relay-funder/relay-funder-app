import { Address } from 'viem';
import { checkAuth } from '@/lib/api/auth';
import { ApiUpstreamError } from '@/lib/api/error';
import { handleError } from '@/lib/api/response';
import { response } from '@/lib/api/response';
import {
  getPassportScore,
  convertPassportScoreToHumanityScore,
  PassportApiError,
  PassportConfigError,
} from '@/lib/human-passport';
import { updateHumanityScore } from '@/lib/api/user';

export interface GetPassportResponse {
  success: boolean;
  address: string;
  humanityScore: number;
  passportScore: string;
  passingScore: boolean;
  threshold: string;
  lastScoreTimestamp: string;
  expirationTimestamp: string;
  stamps?: Record<
    string,
    {
      score: string;
      dedup: boolean;
      expiration_date: string;
    }
  >;
}

export interface GetPassportErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * GET /api/users/human-passport
 *
 * Verifies a Passport score and updates the humanity score in the database
 */
export async function GET(req: Request) {
  try {
    // Authenticate the user
    const session = await checkAuth(['user']);
    const address = session.user.address as Address;

    // Fetch Human Passport score
    let passportData;
    try {
      passportData = await getPassportScore(address);
    } catch (error) {
      if (error instanceof PassportConfigError) {
        console.error('Passport configuration error:', error.message);
        throw new ApiUpstreamError('Passport verification is not configured');
      }
      if (error instanceof PassportApiError) {
        console.error('Passport API error:', error.message, error.status);
        throw new ApiUpstreamError(
          `Failed to retrieve Passport score: ${error.message}`,
        );
      }
      throw error;
    }

    // Check if there was an error in the Passport response
    if (passportData.error) {
      throw new ApiUpstreamError(
        `Passport score unavailable: ${passportData.error}`,
      );
    }

    // Convert the Passport score to our humanity score format
    const humanityScore = convertPassportScoreToHumanityScore(
      passportData.score,
    );

    // Update the humanity score in the database
    await updateHumanityScore(address, humanityScore);

    // Return success with score details
    return response({
      success: true,
      address: passportData.address,
      humanityScore,
      passportScore: passportData.score,
      passingScore: passportData.passing_score,
      threshold: passportData.threshold,
      lastScoreTimestamp: passportData.last_score_timestamp,
      expirationTimestamp: passportData.expiration_timestamp,
      stamps: passportData.stamps,
    });
  } catch (error: unknown) {
    console.error('Error in human-passport route:', error);
    return handleError(error);
  }
}
