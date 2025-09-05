import { type DbCampaign } from '@/types/campaign';
import { RoundCardDashboard } from '../round/card-dashboard';
import { Button } from '../ui';
import { useAuth } from '@/contexts';

export function CampaignDetailTabRounds({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { address } = useAuth();
  const hasRounds = campaign.rounds?.length ?? false;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="prose prose-lg">
        <h2 className="mb-4 text-2xl font-semibold">Rounds</h2>
      </div>
      {hasRounds ? (
        <>
          <p>This Campaign is part of</p>
          {campaign.rounds?.map((round) => (
            <RoundCardDashboard key={round.id} round={round} />
          ))}
        </>
      ) : (
        <>
          <p>This Campaign is not part of any round</p>
          {campaign.creatorAddress === address && (
            <>
              <p>
                You can apply this campaign to a round. Choose a compatible
                round
              </p>
              <Button>Apply Campaign to Round</Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
