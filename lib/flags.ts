'use client';

import { useEffect, useState } from 'react';

// Feature flag configuration with environment variable support
const FLAG_CONFIG = {
  DEBUG: { envVar: 'NEXT_PUBLIC_DEBUG', default: false },
  ROUNDS_VISIBILITY: { envVar: 'NEXT_PUBLIC_ENABLE_ROUNDS_VISIBILITY', default: false },
} as const;

// Initialize flags from environment variables or defaults
const FLAGS = Object.fromEntries(
  Object.entries(FLAG_CONFIG).map(([key, config]) => {
    const envValue = process.env[config.envVar];
    if (envValue !== undefined) {
      // Parse string values to boolean
      return [key, envValue === 'true' || envValue === '1'];
    }
    return [key, config.default];
  })
) as Record<keyof typeof FLAG_CONFIG, boolean>;

export type FeatureFlag = keyof typeof FLAGS;

// Hook to use feature flags in components
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(FLAGS[flag]);
  }, [flag]);

  return isEnabled;
}

// Direct access to flag values (for non-component code)
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FLAGS[flag];
}

// For development: Allow overriding flags in localStorage
if (typeof window !== 'undefined') {
  // Check if we have overrides in localStorage
  const storedFlags = localStorage.getItem('featureFlags');
  if (storedFlags) {
    try {
      const parsedFlags = JSON.parse(storedFlags);
      Object.keys(parsedFlags).forEach((key) => {
        if (key in FLAGS) {
          FLAGS[key as FeatureFlag] = parsedFlags[key];
        }
      });
    } catch (e) {
      console.error('Error parsing feature flags from localStorage', e);
    }
  }
}

// Helper to toggle flags (for development)
export function toggleFeatureFlag(flag: FeatureFlag): void {
  if (typeof window === 'undefined') return;

  const storedFlags = localStorage.getItem('featureFlags');
  const flags = storedFlags ? JSON.parse(storedFlags) : {};

  flags[flag] = !FLAGS[flag];
  localStorage.setItem('featureFlags', JSON.stringify(flags));

  // Force a reload to apply changes
  window.location.reload();
}
