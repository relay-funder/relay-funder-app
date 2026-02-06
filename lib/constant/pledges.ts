/**
 * Retry window for gateway pledges that are stuck in PENDING state.
 *
 * Keep this value shared between API eligibility checks and admin UI affordances
 * so users only see retry actions when the backend will accept them.
 */
export const PLEDGE_PENDING_RETRY_WINDOW_MS = 10 * 60 * 1000;

export const PLEDGE_PENDING_RETRY_WINDOW_SECONDS = Math.floor(
  PLEDGE_PENDING_RETRY_WINDOW_MS / 1000,
);
