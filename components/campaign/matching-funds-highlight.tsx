'use client';

import type { DbCampaign } from '@/types/campaign';

import { Card, CardContent } from '@/components/ui';
import { TrendingUp } from 'lucide-react';

import { useCampaignRounds } from '@/hooks/use-campaign-rounds';

export function CampaignMatchingFundsHighlight({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { hasRounds, activeRounds, futureRounds } = useCampaignRounds({
    campaign,
  });

  // Only show if campaign has active or future rounds (matching funding)
  if (!hasRounds || (activeRounds.length === 0 && futureRounds.length === 0)) {
    return null;
  }

  // Get the most relevant round (active first, then future)
  const primaryRound =
    activeRounds.length > 0 ? activeRounds[0] : futureRounds[0];
  const isActive = activeRounds.length > 0;

  // Calculate estimated match (placeholder logic - can be extended)
  const estimatedMatch = primaryRound.matchingPool
    ? `$${(primaryRound.matchingPool * 0.1).toFixed(2)}` // Simple 10% estimation
    : 'TBD';

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-800">
                {isActive
                  ? 'Matching Funds Active'
                  : 'Matching Funds Available'}
              </span>
            </div>
            <p className="text-sm text-green-700">
              This campaign is participating in quadratic funding with matching
              based on community votes.
            </p>
            <div className="mt-2">
              <span className="text-sm font-medium text-green-800">
                {primaryRound.title}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-green-700">Estimated match</span>
              <span className="text-sm font-semibold text-green-800">
                {estimatedMatch}
              </span>
            </div>
            {primaryRound.matchingPool > 0 && (
              <div className="mt-1">
                <span className="text-xs text-green-600">
                  Pool: ${primaryRound.matchingPool.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
