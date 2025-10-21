'use client';

// Feature flags - values are inlined by Next.js at build time
export const FLAGS = {
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  ROUNDS_VISIBILITY:
    process.env.NEXT_PUBLIC_ENABLE_ROUNDS_VISIBILITY === 'true',
  PAYMENT_METHODS: process.env.NEXT_PUBLIC_PAYMENT_METHODS || 'both',
} as const;

export type FeatureFlag = keyof typeof FLAGS;

// Hook to use boolean feature flags in components
export function useFeatureFlag(
  flag: Extract<FeatureFlag, 'DEBUG' | 'ROUNDS_VISIBILITY'>,
): boolean {
  return FLAGS[flag] as boolean;
}

// Direct access to boolean flags
export function isFeatureEnabled(
  flag: Extract<FeatureFlag, 'DEBUG' | 'ROUNDS_VISIBILITY'>,
): boolean {
  return FLAGS[flag] as boolean;
}

// Direct access to payment methods flag
export function getFeatureFlagString(
  flag: Extract<FeatureFlag, 'PAYMENT_METHODS'>,
): string {
  return FLAGS[flag] as string;
}
