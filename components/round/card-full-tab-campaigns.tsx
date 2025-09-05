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

import { RoundAddDialog } from './add-dialog';
import { CampaignCardRound } from '../campaign/card-round';

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
                    <CampaignCardRound
                      campaign={roundCampaign.campaign}
                      round={round}
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
