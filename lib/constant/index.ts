export { countries } from './countries';
export { categories } from './categories';
export { fundingModels } from './funding-models';
export { EXTERNAL_LINKS } from './external-links';
export { INFINITE_SCROLL_CONFIG } from './infinite-scroll';
export {
  CREATOR_EVENT_POINTS,
  RECEIVER_EVENT_POINTS,
} from './user-score-points';
export * from './tokens';

export const PROJECT_NAME = 'Relay Funder';
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_ADMIN;

// Allo Integration Contract
export const ALLO_ADDRESS = '0x1133eA7Af70876e64665ecD07C0A0476d09465a1';
export const KICKSTARTER_QF_ADDRESS =
  '0x331e239848571d98B917982c16562b6E29DD91C5';

// silk / appkit
export const REOWN_CLOUD_PROJECT_ID =
  process.env.NEXT_PUBLIC_REOWN_CLOUD_PROJECT_ID || '';
// by default allow reown email login, disable by setting the env and redeploy
export const REOWN_FEATURE_EMAIL = !Boolean(
  process.env.NEXT_PUBLIC_REOWN_FEATURE_DISABLE_EMAIL,
);

// privy
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

export const DEFAULT_USER_EMAIL = 'test.donor@relayfunder.com';
export const DEFAULT_SUGGESTED_DONATION_AMOUNTS = [5, 10, 25, 50, 100];

export const FILE_STORAGE_PROVIDER =
  process.env.FILE_STORAGE_PROVIDER ?? 'LOCAL';

export const PINATA_API_JWT_ACCESS_TOKEN =
  process.env.PINATA_API_JWT_ACCESS_TOKEN;
export const NEXT_PUBLIC_PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ?? '';

// Daimo Pay configuration - appId is public for client-side
export const DAIMO_PAY_APP_ID = process.env.NEXT_PUBLIC_DAIMO_PAY_APP_ID ?? '';

// Daimo Pay specific constants
export {
  DAIMO_PAY_USDC_ADDRESS,
  DAIMO_PAY_USDT_ADDRESS,
  DAIMO_PAY_CHAIN_ID,
  DAIMO_PAY_CHAIN_NAME,
  DAIMO_PAY_TOKEN_SYMBOL,
  DAIMO_PAY_MIN_AMOUNT,
  DAIMO_PAY_INITIAL_RESET_DELAY,
  DAIMO_PAY_DEBOUNCE_DELAY,
} from './daimo';

export const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
