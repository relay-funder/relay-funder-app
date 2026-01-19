// ABOUTME: Displays the current humanity score with visual status indicators.
// ABOUTME: Shows score value, verification badge, and check/x icon based on status.

'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui';
import { type ScoreVariant, scoreTextColor } from './types';

interface ScoreDisplayProps {
  displayScore: number;
  scoreVariant: ScoreVariant;
  scoreStatus: string;
}

export function ScoreDisplay({
  displayScore,
  scoreVariant,
  scoreStatus,
}: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="text-sm text-muted-foreground">Current Humanity Score</p>
        <p className={scoreTextColor({ score: scoreVariant })}>
          {displayScore}
        </p>
        <Badge
          variant={scoreVariant === 'high' ? 'default' : 'secondary'}
          className="mt-1"
        >
          {scoreStatus}
        </Badge>
      </div>
      {scoreVariant === 'high' ? (
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />
      )}
    </div>
  );
}
