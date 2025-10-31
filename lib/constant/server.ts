import 'server-only';

// Daimo Pay webhook secret - server-side only
export const DAIMO_PAY_WEBHOOK_SECRET =
  process.env.DAIMO_PAY_WEBHOOK_SECRET ?? '';

// Privy configuration - server-side only
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET ?? '';

// Session Lifetime until automatically logged out.
// Number in days, might be fractional to support 0.0007=60s
// Note: Do NOT use Math.floor() as it breaks fractional day support
export const AUTH_SESSION_LIFETIME = parseFloat(
  process.env.AUTH_SESSION_LIFETIME ?? '30',
);
