'use client';

import type { DbCampaign } from '@/types/campaign';

import { Card, CardContent } from '@/components/ui';
import { TrendingUp } from 'lucide-react';

import { useCampaignRounds } from '@/hooks/use-campaign-rounds';
import { CampaignRoundMatching } from './campaign-round-matching';

const N_ROUNDS_TO_SHOW = 1;

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

  const validRounds = [...activeRounds, ...futureRounds];

  const isActive = activeRounds.length > 0;

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
              This campaign is participating in match funding with matching
              based on community votes.
            </p>
            {validRounds.slice(0, N_ROUNDS_TO_SHOW).map((round) => (
              <CampaignRoundMatching
                key={round.id}
                round={round}
                campaignId={campaign.id}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
