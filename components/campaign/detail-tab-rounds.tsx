import { type DbCampaign } from '@/types/campaign';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts';
import { useCampaignRounds } from '@/hooks/use-campaign-rounds';
import { Rocket } from 'lucide-react';
import { useCallback, useState } from 'react';
import { CampaignAddRoundDialog } from './round/add-dialog';

export function CampaignDetailTabRounds({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { address } = useAuth();
  const {
    hasRounds,
    listingSummary: roundsListingSummary,
    listing: roundsListing,
  } = useCampaignRounds({ campaign });
  const [showApplyCampaignToRoundDialog, setShowApplyCampaignToRoundDialog] =
    useState(false);
  const onApplyCampaignToRound = useCallback(() => {
    setShowApplyCampaignToRoundDialog(true);
  }, []);
  const onApplyCampaignToRoundClosed = useCallback(() => {
    setShowApplyCampaignToRoundDialog(false);
  }, []);
  return (
    <div className="max-w-3xl space-y-4">
      <div className="prose prose-lg">
        <h2 className="mb-4 text-2xl font-semibold">Rounds</h2>
      </div>
      {hasRounds ? (
        <>
          <div className="flex items-center gap-3 text-gray-600">
            <Rocket className="h-5 w-5" />

            {roundsListingSummary}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {roundsListing.activeRounds.length > 0 &&
              roundsListing.activeRounds}
            {roundsListing.futureRounds.length > 0 &&
              roundsListing.futureRounds}
            {roundsListing.pastRounds.length > 0 && roundsListing.pastRounds}
          </div>
        </>
      ) : (
        <p>This Campaign is not part of any round</p>
      )}
      {campaign.creatorAddress === address && (
        <>
          <p>
            As creator of this campaign, you can apply this campaign to a round.
            Choose a compatible round
          </p>
          <Button onClick={onApplyCampaignToRound}>
            Apply Campaign to Round
          </Button>
          {showApplyCampaignToRoundDialog && (
            <CampaignAddRoundDialog
              campaign={campaign}
              onClosed={onApplyCampaignToRoundClosed}
            />
          )}
        </>
      )}
    </div>
  );
}
