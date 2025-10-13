/**
 * Human Passport API Client
 *
 * This module provides utilities to interact with Human Passport API v2
 * to verify user's humanity scores based on their collected stamps.
 *
 * @see https://docs.passport.xyz/building-with-passport/stamps/passport-api/introduction
 */

import { debugApi as debug } from '../debug';
import { PassportApiError, PassportConfigError } from './error';
import type { PassportScoreResponse, PassportStampsResponse } from './types';

const PASSPORT_API_BASE_URL = 'https://api.passport.xyz';
const PASSPORT_API_KEY = process.env.NEXT_PUBLIC_PASSPORT_API_KEY || '';
const PASSPORT_SCORER_ID = process.env.NEXT_PUBLIC_PASSPORT_SCORER_ID || '';

// Configuration for API requests
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds as per API documentation
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // Initial retry delay (1 second)

/**
 * Validates that Passport API configuration is present
 */
function validateConfig() {
  const missingEnvVars: string[] = [];

  if (!PASSPORT_API_KEY) {
    missingEnvVars.push('PASSPORT_API_KEY');
  }
  if (!PASSPORT_SCORER_ID) {
    missingEnvVars.push('PASSPORT_SCORER_ID');
  }

  if (missingEnvVars.length > 0) {
    debug &&
      console.error(
        '[Passport] Configuration validation failed:',
        missingEnvVars,
      );
    throw new PassportConfigError(
      `Missing required environment variable${missingEnvVars.length > 1 ? 's' : ''}: ${missingEnvVars.join(', ')}`,
    );
  }

  debug && console.log('[Passport] Configuration validated');
}

/**
 * Delays execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Makes a single request to the Passport API with timeout
 */
async function makeSingleRequest<T>(url: string, attempt: number): Promise<T> {
  debug &&
    console.log(
      `[Passport] Making request (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`,
      url,
    );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': PASSPORT_API_KEY,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    debug &&
      console.log(
        `[Passport] Response status: ${response.status} ${response.statusText}`,
      );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      debug && console.error('[Passport] API error:', errorData);
      throw new PassportApiError(
        `Passport API request failed: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    const data = (await response.json()) as T;
    debug && console.log('[Passport] Request successful');
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      debug &&
        console.warn(
          `[Passport] Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`,
        );
      throw new PassportApiError(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`,
        408, // Request Timeout
      );
    }

    throw error;
  }
}

/**
 * Makes a request to the Passport API with retry logic
 *
 * The Passport API has a 60-second timeout. If a request times out,
 * this function will retry with exponential backoff.
 */
async function makePassportRequest<T>(endpoint: string): Promise<T> {
  validateConfig();

  const url = `${PASSPORT_API_BASE_URL}${endpoint}`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      return await makeSingleRequest<T>(url, attempt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on authentication or configuration errors
      if (error instanceof PassportApiError) {
        if (error.status === 401 || error.status === 403) {
          throw error;
        }
      }
      if (error instanceof PassportConfigError) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === MAX_RETRY_ATTEMPTS) {
        break;
      }

      // Calculate exponential backoff delay: 1s, 2s, 4s, etc.
      const retryDelay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      debug &&
        console.warn(
          `[Passport] Request failed (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}). Retrying in ${retryDelay}ms...`,
          lastError.message,
        );

      await delay(retryDelay);
    }
  }

  // If we got here, all retries failed
  debug &&
    console.error(
      `[Passport] All ${MAX_RETRY_ATTEMPTS} attempts failed:`,
      lastError?.message,
    );
  throw new PassportApiError(
    `Failed to fetch from Passport API after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message || 'Unknown error'}`,
  );
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
  address: string,
): Promise<PassportScoreResponse> {
  debug && console.log('[Passport] Getting score for address:', address);
  const endpoint = `/v2/stamps/${PASSPORT_SCORER_ID}/score/${address}`;
  const result = await makePassportRequest<PassportScoreResponse>(endpoint);
  debug &&
    console.log(
      '[Passport] Score retrieved:',
      result.score,
      'passing:',
      result.passing_score,
    );
  return result;
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
  const result = await makePassportRequest<PassportStampsResponse>(endpoint);
  debug &&
    console.log('[Passport] Stamps retrieved:', result.items.length, 'items');
  return result;
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
 * Determines if a Passport score meets the recommended threshold
 *
 * @param score - Numeric score to check
 * @param customThreshold - Custom threshold (defaults to 20, the Passport recommendation)
 * @returns Whether the score meets the threshold
 */
export function meetsPassportThreshold(
  score: number,
  customThreshold = 20,
): boolean {
  const meets = score >= customThreshold;
  debug &&
    console.log(
      '[Passport] Threshold check:',
      score,
      '>=',
      customThreshold,
      '->',
      meets,
    );
  return meets;
}
