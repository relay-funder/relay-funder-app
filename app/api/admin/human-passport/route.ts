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
