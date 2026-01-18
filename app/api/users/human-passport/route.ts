import { Address } from 'viem';
import { checkAuth } from '@/lib/api/auth';
import { handleError } from '@/lib/api/response';
import { response } from '@/lib/api/response';
import {
  getPassportScore,
  submitPassportForScoring,
  convertPassportScoreToHumanityScore,
} from '@/lib/human-passport';
import { updateHumanityScore } from '@/lib/api/user';

/**
 * POST /api/users/human-passport
 *
 * Submits address for scoring and retrieves the Passport score,
 * then updates the humanity score in the database.
 */
export async function POST() {
  try {
    // Authenticate the user
    const session = await checkAuth(['user']);
    const address = session.user.address as Address;

    // Submit address for scoring (required before fetching score)
    await submitPassportForScoring(address);

    // Fetch Human Passport score
    const passportData = await getPassportScore(address);

    // Use evidence.rawScore for threshold-based scorers, fall back to score field
    const rawScore =
      passportData.evidence?.rawScore ?? Number(passportData.score || 0);
    const passingScore =
      passportData.evidence?.success ?? passportData.passing_score ?? false;

    // Convert the Passport score to our humanity score format
    const humanityScore = convertPassportScoreToHumanityScore(String(rawScore));

    // Update the humanity score in the database
    await updateHumanityScore(address, humanityScore);

    // Transform stamp_scores to the expected format
    const stamps = Object.fromEntries(
      Object.entries(passportData.stamp_scores).map(([name, score]) => [
        name,
        {
          score: String(score),
          dedup: false,
          expiration_date: passportData.expiration_date || '',
        },
      ]),
    );

    // Return success with score details
    return response({
      success: true,
      address: passportData.address,
      humanityScore,
      passportScore: String(rawScore),
      passingScore,
      threshold:
        passportData.evidence?.threshold?.toString() ?? passportData.threshold,
      lastScoreTimestamp: passportData.last_score_timestamp,
      expirationTimestamp: passportData.expiration_date,
      stamps,
    });
  } catch (error: unknown) {
    console.error('Error in human-passport route:', error);
    return handleError(error);
  }
}
