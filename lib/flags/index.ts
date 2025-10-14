'use client';

import { useEffect, useState } from 'react';
import { type FeatureFlag, FLAGS } from './config';

// Hook to use feature flags in components
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(FLAGS[flag]);
  }, [flag]);

  return isEnabled;
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
