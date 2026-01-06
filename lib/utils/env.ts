/**
 * Environment utilities - centralized environment checks
 * This file can be imported by both constants and web3 config without circular dependencies
 */

// In Vercel (Next.js):
// - Production: NEXT_PUBLIC_VERCEL_ENV === 'production' (mainnet)
// - Preview/Staging: NEXT_PUBLIC_VERCEL_ENV === 'preview' (testnet)
// - Local development: NEXT_PUBLIC_VERCEL_ENV === undefined (testnet)
// Fallback to VERCEL_ENV for local development with vercel CLI
export const IS_PRODUCTION =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production';
