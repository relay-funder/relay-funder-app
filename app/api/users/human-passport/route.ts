import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/api/auth';
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
 * POST /api/users/human-passport
 *
 * Verifies a Passport score and updates the humanity score in the database
 *
 * Request body (optional):
 * - address: Ethereum address to verify (defaults to authenticated user's address)
 */
export async function POST(req: Request) {
  try {
    // Authenticate the user
    const session = await checkAuth(['user']);
    const authenticatedAddress = session.user.address;

    if (!authenticatedAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'No wallet address found in session',
        } as GetPassportErrorResponse,
        { status: 400 },
      );
    }

    // Get the address to verify (either from request body or use authenticated user's address)
    const body = await req.json().catch(() => ({}));
    const addressToVerify = body.address || authenticatedAddress;

    // Fetch Human Passport score
    let passportData;
    try {
      passportData = await getPassportScore(addressToVerify);
    } catch (error) {
      if (error instanceof PassportConfigError) {
        console.error('Passport configuration error:', error.message);
        return NextResponse.json(
          {
            success: false,
            error: 'Passport verification is not configured',
            details: 'Please contact the administrator',
          } as GetPassportErrorResponse,
          { status: 503 },
        );
      }
      if (error instanceof PassportApiError) {
        console.error('Passport API error:', error.message, error.status);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to retrieve Passport score',
            details: error.message,
          } as GetPassportErrorResponse,
          { status: error.status || 500 },
        );
      }
      throw error;
    }

    // Check if there was an error in the Passport response
    if (passportData.error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Passport score unavailable',
          details: passportData.error,
        } as GetPassportErrorResponse,
        { status: 400 },
      );
    }

    // Convert the Passport score to our humanity score format
    const humanityScore = convertPassportScoreToHumanityScore(
      passportData.score,
    );

    // Update the humanity score in the database
    await updateHumanityScore(addressToVerify, humanityScore);

    // Return success with score details
    return response({
      success: true,
      address: addressToVerify,
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
