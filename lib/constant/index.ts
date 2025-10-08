export { countries } from './countries';
export { categories } from './categories';
export { fundingModels } from './funding-models';
export { EXTERNAL_LINKS } from './external-links';
export { INFINITE_SCROLL_CONFIG } from './infinite-scroll';
export {
  CREATOR_EVENT_POINTS,
  RECEIVER_EVENT_POINTS,
} from './user-score-points';
export { ONE_MINUTE_MS, ONE_DAY_MS } from './time';
export { RATE_LIMITS } from './rate-limits';

export const PROJECT_NAME = 'Relay Funder';
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_ADMIN;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS) ?? 6;

// Allo Integration Contract
export const ALLO_ADDRESS = '0x1133eA7Af70876e64665ecD07C0A0476d09465a1';
export const KICKSTARTER_QF_ADDRESS =
  '0x331e239848571d98B917982c16562b6E29DD91C5';

// Crowdsplit API configuration
export const CROWDSPLIT_API_URL = process.env.CROWDSPLIT_API_URL;
export const CROWDSPLIT_CLIENT_ID = process.env.CROWDSPLIT_CLIENT_ID;
export const CROWDSPLIT_CLIENT_SECRET = process.env.CROWDSPLIT_CLIENT_SECRET;
export const CROWDSPLIT_WEBHOOK_SECRET = process.env.CROWDSPLIT_WEBHOOK_SECRET;

// silk / appkit
export const REOWN_CLOUD_PROJECT_ID =
  process.env.NEXT_PUBLIC_REOWN_CLOUD_PROJECT_ID || '';

// privy
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET ?? '';

export const DEFAULT_USER_EMAIL = 'test.donor@relayfunder.com';
export const DEFAULT_SUGGESTED_DONATION_AMOUNTS = [1, 5, 10, 20, 50];

export const FILE_STORAGE_PROVIDER =
  process.env.FILE_STORAGE_PROVIDER ?? 'LOCAL';

export const PINATA_API_JWT_ACCESS_TOKEN =
  process.env.PINATA_API_JWT_ACCESS_TOKEN;
export const NEXT_PUBLIC_PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ?? '';
