import { checkAuth } from '@/lib/api/auth';
import { handleError } from '@/lib/api/response';
import { response } from '@/lib/api/response';
import {
  getPassportScore,
  convertPassportScoreToHumanityScore,
} from '@/lib/human-passport';
import { updateHumanityScore } from '@/lib/api/user';
import { z } from 'zod';
import { isAddress } from 'viem';
import { ApiParameterError } from '@/lib/api/error';

const HumanPassportBodySchema = z.object({
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .refine((addr) => isAddress(addr), 'Invalid Ethereum address'),
});

/**
 * POST /api/admin/human-passport
 *
 * Verifies a Passport score and updates the humanity score in the database
 *
 * Request body:
 * - address: Ethereum address to verify
 */
export async function POST(req: Request) {
  try {
    await checkAuth(['admin']);

    // Get the address to verify (either from request body or use authenticated user's address)
    const json = await req.json().catch(() => ({}));
    const parsed = HumanPassportBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiParameterError(
        'Invalid request body',
        parsed.error.flatten().fieldErrors,
      );
    }

    const { address } = parsed.data;

    // Fetch Human Passport score
    const passportData = await getPassportScore(address);

    // Use evidence.rawScore for threshold-based scorers, fall back to score field
    const rawScore =
      passportData.evidence?.rawScore ?? Number(passportData.score || 0);

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
      passingScore:
        passportData.evidence?.success ?? passportData.passing_score ?? false,
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
