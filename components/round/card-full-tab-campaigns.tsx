import { GetRoundResponseInstance } from '@/lib/api/types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/contexts';

import { RoundAddDialog } from './campaign/add-dialog';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { RoundCardCampaignStatus } from '@/components/round/card-campaign-status';
import { RoundCampaignAdminControls } from '@/components/round/campaign-admin-controls';

export function RoundCardTabCampaigns({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);

  const roundCampaigns = useMemo(() => {
    return round.roundCampaigns ?? [];
  }, [round]);
  const numberOfCampaigns = useMemo(() => {
    return roundCampaigns.length;
  }, [roundCampaigns]);
  const onAddCampaign = useCallback(() => {
    setAddCampaignOpen(true);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Participating Campaigns</CardTitle>
          <CardDescription>
            Campaigns approved to participate in this funding round.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {numberOfCampaigns > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2">
                {roundCampaigns.map((roundCampaign) => (
                  <div key={roundCampaign.id}>
                    <CampaignCard
                      campaign={roundCampaign.campaign}
                      type="round"
                      round={round}
                      statusIndicators={
                        roundCampaign.campaign ? (
                          <RoundCardCampaignStatus
                            campaign={roundCampaign.campaign}
                            round={round}
                          />
                        ) : null
                      }
                      roundAdminFooterControls={
                        roundCampaign.campaign ? (
                          <RoundCampaignAdminControls
                            campaign={roundCampaign.campaign}
                            round={round}
                          />
                        ) : null
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No campaigns have been approved for this round yet.
            </p>
          )}
          <Button className="w-full" onClick={onAddCampaign}>
            {isAdmin ? 'Add Campaign' : 'Add your Campaign'}
          </Button>
        </CardContent>
      </Card>
      {addCampaignOpen && (
        <RoundAddDialog
          round={round}
          onClosed={() => setAddCampaignOpen(false)}
        />
      )}
    </>
  );
}
