import 'server-only';

// Daimo Pay webhook secret - server-side only
export const DAIMO_PAY_WEBHOOK_SECRET =
  process.env.DAIMO_PAY_WEBHOOK_SECRET ?? '';

// Privy configuration - server-side only
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET ?? '';
