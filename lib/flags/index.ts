'use client';

// Feature flags - values are inlined by Next.js at build time
export const FLAGS = {
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  ROUNDS_VISIBILITY:
    process.env.NEXT_PUBLIC_ENABLE_ROUNDS_VISIBILITY === 'true',
  HUMAN_PASSPORT:
    process.env.NEXT_PUBLIC_ENABLE_HUMAN_PASSPORT !== undefined
      ? process.env.NEXT_PUBLIC_ENABLE_HUMAN_PASSPORT === 'true'
      : false,
  PAYMENT_METHODS:
    process.env.NEXT_PUBLIC_PAYMENT_METHODS || 'daimo-and-crypto',
} as const;

export type FeatureFlag = keyof typeof FLAGS;

// Hook to use boolean feature flags in components
export function useFeatureFlag(
  flag: Extract<FeatureFlag, 'DEBUG' | 'ROUNDS_VISIBILITY' | 'HUMAN_PASSPORT'>,
): boolean {
  return FLAGS[flag] as boolean;
}

// Direct access to boolean flags
export function isFeatureEnabled(
  flag: Extract<FeatureFlag, 'DEBUG' | 'ROUNDS_VISIBILITY' | 'HUMAN_PASSPORT'>,
): boolean {
  return FLAGS[flag] as boolean;
}

// Direct access to payment methods flag
export function getFeatureFlagString(
  flag: Extract<FeatureFlag, 'PAYMENT_METHODS'>,
): string {
  return FLAGS[flag] as string;
}
