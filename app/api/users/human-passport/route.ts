import { Address } from 'viem';
import { checkAuth } from '@/lib/api/auth';
import { handleError } from '@/lib/api/response';
import { response } from '@/lib/api/response';
import {
  getPassportScore,
  convertPassportScoreToHumanityScore,
} from '@/lib/human-passport';
import { updateHumanityScore } from '@/lib/api/user';

/**
 * POST /api/users/human-passport
 *
 * Verifies a Passport score and updates the humanity score in the database
 */
export async function POST() {
  try {
    // Authenticate the user
    const session = await checkAuth(['user']);
    const address = session.user.address as Address;

    // Fetch Human Passport score
    const passportData = await getPassportScore(address);

    // Convert the Passport score to our humanity score format
    const humanityScore = convertPassportScoreToHumanityScore(
      passportData.score || '0',
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
