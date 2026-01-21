import 'server-only';

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
  PASSPORT_SCORER_ID,
} from '@/lib/constant';
import { RetryFetchError, retryFetchJsonWithSchema } from '@/lib/utils/retry';
import {
  PassportScoreResponseSchema,
  PassportStampsResponseSchema,
  type PassportScoreResponse,
  type PassportStampsResponse,
} from '@/lib/api/types';
import { ApiUpstreamError } from '@/lib/api/error';

function rethrowAsPassportError(error: unknown, ctx: string): never {
  if (error instanceof RetryFetchError) {
    throw new ApiUpstreamError(`${ctx}: ${error.message} - ${error.status}`);
  }
  if (error instanceof Error) {
    throw new ApiUpstreamError(`${ctx}: ${error.message} `);
  }
  throw new ApiUpstreamError(`${ctx}: ${String(error)}`);
}

const defaultHeaders = {
  'X-API-KEY': PASSPORT_API_KEY,
  'Content-Type': 'application/json',
};

const defaultInit: RequestInit = {
  headers: defaultHeaders,
  method: 'GET',
};

/**
 * Submits an address to the Passport scorer for scoring.
 * This must be called before getPassportScore for addresses that haven't been scored yet.
 *
 * @param address - Ethereum address to submit for scoring
 * @returns The submission response (may include score if already available)
 */
export async function submitPassportForScoring(
  address: Address,
): Promise<void> {
  debug && console.log('[Passport] Submitting address for scoring:', address);
  const url = `${PASSPORT_API_BASE_URL}/registry/submit-passport`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        address,
        scorer_id: PASSPORT_SCORER_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      debug &&
        console.error('[Passport] Submit error:', response.status, errorText);
      throw new ApiUpstreamError(
        `submitPassportForScoring: HTTP ${response.status} - ${errorText}`,
      );
    }

    debug && console.log('[Passport] Address submitted successfully');
  } catch (error) {
    if (error instanceof ApiUpstreamError) throw error;
    console.error('[Passport] Error submitting address:', error);
    rethrowAsPassportError(error, 'submitPassportForScoring');
  }
}

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
  const endpoint = `/registry/score/${PASSPORT_SCORER_ID}/${address}`;
  const url = `${PASSPORT_API_BASE_URL}${endpoint}`;

  try {
    const result = await retryFetchJsonWithSchema(
      PassportScoreResponseSchema,
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

  const endpoint = `/registry/stamps/${address}?include_metadata=${includeMetadata}`;
  const url = `${PASSPORT_API_BASE_URL}${endpoint}`;

  try {
    const result = await retryFetchJsonWithSchema(
      PassportStampsResponseSchema,
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
