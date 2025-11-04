import { debugApi as debug } from '@/lib/debug';
import { PASSPORT_SCORE_THRESHOLD } from '@/lib/constant';

/**
 * Converts a Passport score (as string) to a numeric humanity score
 *
 * The Passport score is typically a decimal string (e.g., "33.538").
 * This function rounds it to an integer for storage in the database.
 *
 * @param scoreString - Score string from Passport API
 * @returns Integer score suitable for database storage
 */
export function convertPassportScoreToHumanityScore(
  scoreString: string,
): number {
  const score = parseFloat(scoreString);
  if (!Number.isFinite(score)) {
    debug &&
      console.warn(
        '[Passport] Invalid score string, returning 0:',
        scoreString,
      );
    return 0;
  }
  const rounded = Math.max(Math.round(score), 0);
  debug &&
    console.log('[Passport] Converted score:', scoreString, '->', rounded);
  return rounded;
}

/**
 * Determines if a Passport score meets the set threshold
 *
 * @param score - Numeric score to check
 * @returns Whether the score meets the threshold
 */
export function checkPassportScorePassed(score: number) {
  return score >= PASSPORT_SCORE_THRESHOLD;
}
