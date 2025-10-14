export { countries } from './countries';
export { categories } from './categories';
export { fundingModels } from './funding-models';
export { EXTERNAL_LINKS } from './external-links';
export { INFINITE_SCROLL_CONFIG } from './infinite-scroll';
export {
  CREATOR_EVENT_POINTS,
  RECEIVER_EVENT_POINTS,
} from './user-score-points';
export {
  PASSPORT_API_BASE_URL,
  PASSPORT_API_KEY,
  PASSPORT_SCORER_ID,
  PASSPORT_SCORE_THRESHOLD,
} from './human-passport';

export const PROJECT_NAME = 'Relay Funder';
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_ADMIN;
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  '0x01C5C0122039549AD1493B8220cABEdD739BC44E'; // Celo/Sepolia
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS) ?? 6;
export const USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ??
  '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e'; // https://blog.celo.org/tether-token-usdt-is-now-available-on-celo-2f0a518d3ef5
export const USDT_DECIMALS = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS) ?? 6;

export const USD_TOKEN: 'USDC' | 'USDT' =
  process.env.NEXT_PUBLIC_USD_TOKEN === 'USDC' ? 'USDC' : 'USDT';
export const USD_ADDRESS = USD_TOKEN === 'USDC' ? USDC_ADDRESS : USDT_ADDRESS;
export const USD_DECIMALS =
  USD_TOKEN === 'USDC' ? USDC_DECIMALS : USDT_DECIMALS;

// Allo Integration Contract
export const ALLO_ADDRESS = '0x1133eA7Af70876e64665ecD07C0A0476d09465a1';
export const KICKSTARTER_QF_ADDRESS =
  '0x331e239848571d98B917982c16562b6E29DD91C5';

// silk / appkit
export const REOWN_CLOUD_PROJECT_ID =
  process.env.NEXT_PUBLIC_REOWN_CLOUD_PROJECT_ID || '';

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
