/**
 * Environment utilities - centralized environment checks
 * This file can be imported by both constants and web3 config without circular dependencies
 */

export const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
