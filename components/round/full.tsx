'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { PageHome } from '@/components/page/home';
import { Calendar, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { GetRoundResponseInstance } from '@/lib/api/types';

import { useRound } from '@/lib/hooks/useRounds';
import { RoundLoading } from './loading';
import { RoundMainImageAvatar } from './main-image-avatar';
import { FormattedDate } from '../formatted-date';
import { useMemo, useEffect } from 'react';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import { CampaignCardItem } from '@/components/campaign/campaign-card';
import { CampaignCardRoundAdmin } from '@/components/campaign/card-round-admin';
import { useAuth } from '@/contexts';
import { ReadMoreDescription } from '@/components/ui/read-more-description';

export function RoundFull({ id }: { id: number }) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic or early returns
  const { data: roundInstance, isPending } = useRound(id);
  const { isAdmin } = useAuth();

  // Call hooks with safe defaults for when round might be undefined
  const round = roundInstance?.round;
  const status = useRoundStatus(round);
  useRoundTimeInfo(round);
  const numberOfCampaigns = useMemo(() => {
    return round?.roundCampaigns?.length ?? 0;
  }, [round]);

  // Debug logging for admin round data - only when round exists
  useEffect(() => {
    if (!round) return;

    console.log('RoundFull - Round data:', {
      roundId: round.id,
      roundTitle: round.title,
      isAdminView: isAdmin,
      roundCampaignsCount: round.roundCampaigns?.length,
      roundCampaignStatuses: round.roundCampaigns?.slice(0, 3).map((rc) => ({
        id: rc.id,
        status: rc.status,
        campaignId: rc.campaign?.id,
        campaignStatus: rc.campaign?.status,
        campaignTitle: rc.campaign?.title?.substring(0, 30),
      })),
    });
  }, [round, isAdmin]);

  // NOW handle conditional rendering after all hooks are called
  if (isPending) {
    return <RoundLoading />;
  }

  if (!round) {
    notFound();
  }

  const header = <PageHeader title={round.title} />;

  return (
    <PageHome header={header}>
      <div className="space-y-6">
        {/* Round Info Section - Compact Layout with Large Logo */}
        <div className="space-y-6">
          {/* Round Header with Large Logo and Status */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <RoundMainImageAvatar round={round} size="large" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight">
                  {round.title ?? 'Untitled Round'}
                </h1>
                {round.description && (
                  <ReadMoreDescription
                    text={round.description}
                    maxLength={350}
                  />
                )}
              </div>
            </div>
            <Badge
              variant={status.variant}
              className="shrink-0 px-3 py-1 text-sm"
            >
              {status.text}
            </Badge>
          </div>

          {/* Stats and Timeline Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Matching Pool */}
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Matching Pool</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                ${round.matchingPool.toLocaleString()}
              </p>
            </Card>

            {/* Campaigns Count */}
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Campaigns</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {numberOfCampaigns}
              </p>
            </Card>

            {/* Round Period */}
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Round Period</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                <FormattedDate date={new Date(round.startTime)} /> -{' '}
                <FormattedDate date={new Date(round.endTime)} />
              </p>
            </Card>

            {/* Applications Period */}
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Applications</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                <FormattedDate date={new Date(round.applicationStartTime)} /> -{' '}
                <FormattedDate date={new Date(round.applicationEndTime)} />
              </p>
            </Card>
          </div>
        </div>

        {/* Participating Campaigns Section - Prominent Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Participating Campaigns
              </h2>
              <p className="text-muted-foreground">
                {numberOfCampaigns > 0
                  ? `${numberOfCampaigns} campaigns are participating in this round`
                  : 'No active campaigns have been approved for this round yet'}
              </p>
            </div>
          </div>

          {numberOfCampaigns > 0 ? (
            <RoundCampaignsList round={round} isAdmin={isAdmin} />
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="mb-2 text-lg font-medium">
                  No Active Campaigns Yet
                </p>
                <p>
                  Active campaigns will appear here once they&apos;re approved
                  to participate in this round.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageHome>
  );
}

// Component to display round campaigns similar to homepage listing
function RoundCampaignsList({
  round,
  isAdmin = false,
}: {
  round: GetRoundResponseInstance;
  isAdmin?: boolean;
}) {
  const campaigns = useMemo(() => {
    return (
      round.roundCampaigns
        ?.map((rc) => rc.campaign)
        .filter((campaign): campaign is NonNullable<typeof campaign> =>
          Boolean(campaign),
        ) ?? []
    );
  }, [round.roundCampaigns]);

  // Debug logging to help troubleshoot campaign data
  useEffect(() => {
    console.log('RoundCampaignsList - Round campaigns data:', {
      roundCampaignsCount: round.roundCampaigns?.length,
      campaignsCount: campaigns.length,
      isAdminView: isAdmin,
      roundCampaignStatuses: round.roundCampaigns?.map((rc) => ({
        campaignId: rc.campaign?.id,
        campaignTitle: rc.campaign?.title,
        campaignStatus: rc.campaign?.status,
        roundCampaignStatus: rc.status,
      })),
      firstCampaign: campaigns[0]
        ? {
            id: campaigns[0].id,
            title: campaigns[0].title,
            status: campaigns[0].status,
            hasMedia: Array.isArray(campaigns[0].media),
            mediaCount: campaigns[0].media?.length,
            hasImages: Array.isArray(campaigns[0].images),
            imagesCount: campaigns[0].images?.length,
          }
        : null,
    });
  }, [campaigns, round.roundCampaigns, isAdmin]);

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => {
        if (isAdmin) {
          return (
            <CampaignCardRoundAdmin
              key={campaign.id}
              campaign={campaign}
              round={round}
            />
          );
        }
        return <CampaignCardItem key={campaign.id} campaign={campaign} />;
      })}
    </div>
  );
}
