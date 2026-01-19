// ABOUTME: Shared types and style variants for passport verification components.
// ABOUTME: Contains CVA style definitions for score-based visual feedback.

import { cva } from 'class-variance-authority';

export type ScoreVariant = 'high' | 'medium' | 'low';

export interface PassportVerificationCardProps {
  currentScore?: number;
}

export interface PassportScoreData {
  humanityScore?: number;
  passportScore?: string | number;
  passingScore?: boolean;
  success?: boolean;
  expirationTimestamp?: string | null;
  stamps?: Record<string, { score: string; dedup?: boolean }>;
}

export const scoreTextColor = cva('text-3xl font-bold', {
  variants: {
    score: {
      high: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-red-600 dark:text-red-400',
    },
  },
  defaultVariants: {
    score: 'low',
  },
});

export const scoreBadgeColor = cva('', {
  variants: {
    score: {
      high: 'bg-green-600 dark:bg-green-400',
      medium: 'bg-yellow-600 dark:bg-yellow-400',
      low: 'bg-red-600 dark:bg-red-400',
    },
  },
  defaultVariants: {
    score: 'low',
  },
});
