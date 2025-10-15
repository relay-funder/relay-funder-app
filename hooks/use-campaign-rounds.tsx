import { RoundCardMinimal } from '@/components/round/card-minimal';
import {
  GetRoundCampaignResponseInstance,
  GetRoundResponseInstance,
} from '@/lib/api/types';
import { DbCampaign } from '@/types/campaign';
import { useMemo } from 'react';

export function useCampaignRounds({
  campaign,
  includePendingInFuture = true,
}: {
  campaign?: DbCampaign;
  includePendingInFuture?: boolean;
}) {
  const rounds = useMemo(() => {
    if (!Array.isArray(campaign?.rounds) || campaign.rounds.length === 0) {
      return [] as GetRoundResponseInstance[];
    }
    return campaign.rounds.map((round) => {
      // api does not recursively populate round-campaign-route. as some
      // components rely on round.roundCampaigns.campaign, populate at least
      // the current campaign into the round here
      const roundCampaigns: GetRoundCampaignResponseInstance[] = round
        .roundCampaigns?.length
        ? round.roundCampaigns
        : [
            {
              ...round,
              roundId: round.id,
              campaignId: campaign.id,
              campaign,
              status: round.recipientStatus,
              onchainRecipientId: null,
              recipientAddress: null,
              submittedByWalletAddress: null,
              txHash: null,
              reviewedAt: new Date().toISOString(),
            } as GetRoundCampaignResponseInstance,
          ];
      return { ...round, roundCampaigns };
    });
  }, [campaign]);
  const activeRounds = useMemo(() => {
    const now = new Date();
    return rounds.filter((round) => {
      return (
        now >= new Date(round.startTime) &&
        now <= new Date(round.endTime) &&
        round.recipientStatus === 'APPROVED'
      );
    });
  }, [rounds]);
  const pastRounds = useMemo(() => {
    const now = new Date();
    return rounds.filter((round) => {
      return (
        now > new Date(round.endTime) && round.recipientStatus === 'APPROVED'
      );
    });
  }, [rounds]);
  const futureRounds = useMemo(() => {
    const now = new Date();
    return rounds.filter((round) => {
      const isFutureByTime = now < new Date(round.startTime);
      const isPending = round.recipientStatus === 'PENDING';

      if (includePendingInFuture) {
        return isFutureByTime || isPending;
      } else {
        // Only include future rounds by time, exclude pending status
        return isFutureByTime && round.recipientStatus === 'APPROVED';
      }
    });
  }, [rounds, includePendingInFuture]);
  const title = useMemo(() => {
    if (
      pastRounds.length === 0 &&
      activeRounds.length === 0 &&
      futureRounds.length === 0
    ) {
      return '';
    }
    let title = '';
    if (activeRounds.length) {
      title +=
        title != ''
          ? '\n'
          : '' +
            `Participates in ${activeRounds.length} ${activeRounds.length > 1 ? 'Rounds' : 'Round'}`;
      title += '\n- ' + activeRounds.map((round) => round.title).join('\n- ');
    }
    if (pastRounds.length) {
      title +=
        (title != '' ? '\n' : '') +
        `Has participated in ${pastRounds.length} ${pastRounds.length > 1 ? 'Rounds' : 'Round'} in the past`;
      title += '\n- ' + pastRounds.map((round) => round.title).join('\n- ');
    }
    if (futureRounds.length) {
      title +=
        (title != '' ? '\n' : '') +
        `Will participate in ${futureRounds.length} ${futureRounds.length > 1 ? 'Rounds' : 'Round'}`;
      title += '\n- ' + futureRounds.map((round) => round.title).join('\n- ');
    }
    return title;
  }, [pastRounds, activeRounds, futureRounds]);
  const listingSummary = useMemo(() => {
    if (
      pastRounds.length === 0 &&
      activeRounds.length === 0 &&
      futureRounds.length === 0
    ) {
      return null;
    }

    return (
      <>
        {activeRounds.length > 0 && (
          <p>
            Participates in {activeRounds.length}{' '}
            {activeRounds.length > 1 ? 'Rounds' : 'Round'}
          </p>
        )}
        {pastRounds.length > 0 && (
          <p>
            Has participated in {pastRounds.length}{' '}
            {pastRounds.length > 1 ? 'Rounds' : 'Round'} in the past
          </p>
        )}
        {futureRounds.length > 0 && (
          <p>
            Will participate in {futureRounds.length}{' '}
            {futureRounds.length > 1 ? 'Rounds' : 'Round'} in the future
          </p>
        )}
      </>
    );
  }, [pastRounds, activeRounds, futureRounds]);
  const listing = useMemo(() => {
    function mapRounds(round: GetRoundResponseInstance) {
      return (
        <RoundCardMinimal key={round.id} round={round} campaign={campaign} />
      );
    }

    return {
      pastRounds: pastRounds.map(mapRounds),
      activeRounds: activeRounds.map(mapRounds),
      futureRounds: futureRounds.map(mapRounds),
    };
  }, [pastRounds, activeRounds, futureRounds, campaign]);
  const hasRounds = useMemo(() => {
    return rounds.length > 0;
  }, [rounds]);
  return {
    title,
    listing,
    listingSummary,
    hasRounds,
    activeRounds,
    pastRounds,
    futureRounds,
    rounds,
  };
}
