/**
 * Treasury-related constants
 */

// Time delays in seconds
export const TREASURY_DELAYS = {
  WITHDRAWAL_DELAY: 3600, // 1 hour
  REFUND_DELAY: 7200, // 2 hours
  CONFIG_LOCK_PERIOD: 1800, // 30 minutes
} as const;

// Treasury configuration flags
export const TREASURY_CONFIG = {
  IS_COLOMBIAN: false,
} as const;

// Gas limits for treasury operations
export const TREASURY_GAS_LIMITS = {
  DEPLOY: 2000000,
  CONFIGURE: 1000000,
  WITHDRAW: 300000, // Gas limit for withdrawal transactions
} as const;

// USDC token configuration
export const USDC_CONFIG = {
  DECIMALS: 6,
  MIN_WITHDRAWAL_FEE_EXEMPTION: '0.5', // 0.5 USDC threshold
} as const;

// Platform fee configuration
export const PLATFORM_CONFIG = {
  FEE_PERCENT: 0, // 0.00% (in basis points: 0 = 0%)
} as const;

// Fee key names for keccak256 hashing
export const FEE_KEYS = {
  FLAT_FEE: 'flatFee',
  CUMULATIVE_FLAT_FEE: 'cumulativeFlatFee',
  PLATFORM_FEE: 'platformFee',
  VAKI_COMMISSION: 'vakiCommission',
} as const;

// Treasury implementation IDs
export const TREASURY_IMPLEMENTATIONS = {
  KEEP_WHATS_RAISED: 0,
} as const;
