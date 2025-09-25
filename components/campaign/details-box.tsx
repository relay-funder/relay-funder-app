'use client';

import type { DbCampaign } from '@/types/campaign';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { MapPin, Target, Rocket } from 'lucide-react';

import { useCampaignRounds } from '@/hooks/use-campaign-rounds';

export function CampaignDetailsBox({ campaign }: { campaign: DbCampaign }) {
  const {
    hasRounds,
    listingSummary: roundsListingSummary,
    title: roundsTitle,
  } = useCampaignRounds({ campaign });

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-semibold">Campaign Details</h3>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{campaign.location || 'Location not specified'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="h-4 w-4" />
          <span>
            Campaign ends {new Date(campaign.endTime).toLocaleDateString()}
          </span>
        </div>
        {hasRounds && (
          <div
            className="flex items-center gap-2 text-sm text-gray-600"
            title={roundsTitle}
          >
            <Rocket className="h-4 w-4" />
            <div>{roundsListingSummary}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
