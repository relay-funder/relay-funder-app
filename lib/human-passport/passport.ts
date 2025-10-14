/**
 * Human Passport API Client
 *
 * This module provides utilities to interact with Human Passport API v2
 * to verify user's humanity scores based on their collected stamps.
 *
 * @see https://docs.passport.xyz/building-with-passport/stamps/passport-api/introduction
 */

import { Address } from 'viem';
import { debugApi as debug } from '@/lib/debug';
import {
  PASSPORT_API_BASE_URL,
  PASSPORT_API_KEY,
  PASSPORT_SCORE_THRESHOLD,
  PASSPORT_SCORER_ID,
} from '@/lib/constant';
import { RetryFetchError, retryFetchJson } from '@/lib/utils/retry';
import type {
  PassportScoreResponse,
  PassportStampsResponse,
} from '@/lib/api/types';
import { PassportApiError } from './error';

function rethrowAsPassportError(error: unknown, ctx: string): never {
  if (error instanceof RetryFetchError) {
    throw new PassportApiError(`${ctx}: ${error.message}`, error.status);
  }
  if (error instanceof Error) {
    throw new PassportApiError(`${ctx}: ${error.message}`);
  }
  throw new PassportApiError(`${ctx}: ${String(error)}`);
}

const defaultInit: RequestInit = {
  headers: {
    'X-API-KEY': PASSPORT_API_KEY,
    'Content-Type': 'application/json',
  },
  method: 'GET',
};

/**
 * Retrieves the Passport score for a given Ethereum address
 *
 * @param address - Ethereum address to check (normalized or checksummed)
 * @returns Passport score data including overall score and individual stamp scores
 *
 * @example
 * ```typescript
 * const scoreData = await getPassportScore('0x1234...');
 * if (scoreData.passing_score) {
 *   console.log(`User passed with score: ${scoreData.score}`);
 * }
 * ```
 */
export async function getPassportScore(
  address: Address,
): Promise<PassportScoreResponse> {
  debug && console.log('[Passport] Getting score for address:', address);
  const endpoint = `/v2/stamps/${PASSPORT_SCORER_ID}/score/${address}`;
  const url = `${PASSPORT_API_BASE_URL}${endpoint}`;

  try {
    const result = await retryFetchJson<PassportScoreResponse>(
      url,
      defaultInit,
    );

    debug &&
      console.log(
        '[Passport] Score retrieved:',
        result.score,
        'passing:',
        result.passing_score,
      );
    return result;
  } catch (error) {
    console.error('[Passport] Error getting score:', error);
    rethrowAsPassportError(error, 'getPassportScore');
  }
}

/**
 * Retrieves all stamps collected by a given Ethereum address
 *
 * @param address - Ethereum address to check
 * @param includeMetadata - Whether to include metadata in the response
 * @returns List of stamps collected by the address
 *
 * @example
 * ```typescript
 * const stamps = await getPassportStamps('0x1234...', true);
 * console.log(`User has ${stamps.items.length} stamps`);
 * ```
 */
export async function getPassportStamps(
  address: string,
  includeMetadata = false,
): Promise<PassportStampsResponse> {
  debug &&
    console.log(
      '[Passport] Getting stamps for address:',
      address,
      'includeMetadata:',
      includeMetadata,
    );

  const endpoint = `/v2/stamps/${address}?include_metadata=${includeMetadata}`;
  const url = `${PASSPORT_API_BASE_URL}${endpoint}`;

  try {
    const result = await retryFetchJson<PassportStampsResponse>(
      url,
      defaultInit,
    );

    debug &&
      console.log('[Passport] Stamps retrieved:', result.items.length, 'items');
    return result;
  } catch (error) {
    console.error('[Passport] Error getting stamps:', error);
    rethrowAsPassportError(error, 'getPassportStamps');
  }
}

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
  if (isNaN(score)) {
    debug &&
      console.warn(
        '[Passport] Invalid score string, returning 0:',
        scoreString,
      );
    return 0;
  }
  const rounded = Math.round(score);
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
