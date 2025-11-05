'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { PageHome } from '@/components/page/home';
import { Calendar, Users, DollarSign, ExternalLink } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { GetRoundResponseInstance } from '@/lib/api/types';

import { useRound } from '@/lib/hooks/useRounds';
import { RoundLoading } from './loading';
import { RoundMainImageAvatar } from './main-image-avatar';
import { FormattedDate } from '../formatted-date';
import { useMemo, useEffect, useState } from 'react';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { RoundCardCampaignStatus } from '@/components/round/card-campaign-status';
import { RoundCampaignAdminControls } from '@/components/round/campaign-admin-controls';
import { useAuth } from '@/contexts';
import { ReadMoreDescription } from '@/components/ui/read-more-description';
import { debugComponentData as debug } from '@/lib/debug';
import { RoundManageResults } from './manage-results';
import { RoundAdminInlineEdit } from './admin/inline-edit';
import { RoundApplyDialog } from './apply-dialog';
import { Button } from '@/components/ui';

export function RoundFull({
  id,
  forceUserView = false,
}: {
  id: number;
  forceUserView?: boolean;
}) {
  const { data: roundInstance, isPending } = useRound(id, forceUserView);
  const { isAdmin: authIsAdmin, authenticated, address } = useAuth();

  // Force user view if specified, otherwise use actual admin status
  const isAdmin = forceUserView ? false : authIsAdmin;
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  // Call hooks with safe defaults for when round might be undefined
  const round = roundInstance?.round;
  const status = useRoundStatus(round);
  useRoundTimeInfo(round);
  const numberOfCampaigns = useMemo(() => {
    if (!round?.roundCampaigns) return 0;

    // For admin users: count all campaigns
    if (isAdmin) return round.roundCampaigns.length;

    // For regular users: count approved campaigns + their own campaigns (any status)
    return round.roundCampaigns.filter((rc) => {
      const isOwnCampaign = rc.campaign?.creatorAddress === address;
      const isApproved = rc.status === 'APPROVED';
      return isApproved || (isOwnCampaign && !!address); // Simplified: if address exists, user is authenticated
    }).length;
  }, [round, isAdmin, address]);

  // Debug logging for admin round data - only when round exists
  useEffect(() => {
    if (!round) return;

    debug &&
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

  const header = <PageHeader />;

  return (
    <PageHome header={header}>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {isAdmin && status.text === 'Ended' && (
            <RoundManageResults round={round} />
          )}
          {/* Round Info Section - Compact Layout with Large Logo */}
          <div className="space-y-6">
            {/* Round Header with Large Logo and Status */}
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
              <div className="flex flex-col items-center gap-6 xxs:flex-row xxs:items-start">
                <div className="hidden shrink-0 xs:block">
                  <RoundMainImageAvatar round={round} size="large" />
                </div>
                <div className="shrink-0 xs:hidden">
                  <RoundMainImageAvatar round={round} size="medium" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight xs:text-3xl">
                    {round.title ?? 'Untitled Round'}
                  </h1>
                  {/* Round URL - displayed below title with clickable icon */}
                  {round.descriptionUrl && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <a
                        href={round.descriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs transition-colors hover:text-foreground hover:underline xs:text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate">{round.descriptionUrl}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={status.variant}
                  className="shrink-0 px-3 py-1 text-sm"
                >
                  {status.text}
                </Badge>
                {isAdmin && <RoundAdminInlineEdit round={round} />}
              </div>
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
                  <FormattedDate date={new Date(round.applicationStartTime)} />{' '}
                  - <FormattedDate date={new Date(round.applicationEndTime)} />
                </p>
              </Card>
            </div>
          </div>

          {/* Round Description Section - Only on detail page */}
          {round.description && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">About This Round</h2>
              <ReadMoreDescription text={round.description} maxLength={350} />
            </div>
          )}

          {/* Participating Campaigns Section - Prominent Display */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-between gap-2 xs:flex-row">
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
              {/* Apply to Round Button - Only for authenticated non-admin users */}
              {authenticated && !isAdmin && (
                <Button
                  onClick={() => setShowApplyDialog(true)}
                  variant="default"
                  className="shrink-0"
                >
                  Apply Campaign
                </Button>
              )}
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

        {/* Apply Dialog */}
        {showApplyDialog && (
          <RoundApplyDialog
            round={round}
            onClosed={() => setShowApplyDialog(false)}
          />
        )}
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
  const { address } = useAuth();

  const campaigns = useMemo(() => {
    return (
      round.roundCampaigns
        ?.map((rc) => rc.campaign)
        .filter((campaign): campaign is NonNullable<typeof campaign> => {
          if (!campaign) return false;

          // For admin users: show all campaigns
          if (isAdmin) return true;

          // For regular users: show approved campaigns + their own campaigns (any status)
          const isOwnCampaign = campaign.creatorAddress === address;
          const isApproved =
            round.roundCampaigns?.find((rc) => rc.campaignId === campaign.id)
              ?.status === 'APPROVED';

          return isApproved || (isOwnCampaign && !!address);
        }) ?? []
    );
  }, [round.roundCampaigns, isAdmin, address]);

  // Debug logging to help troubleshoot campaign data
  useEffect(() => {
    debug &&
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
              hasPaymentSummary: !!campaigns[0].paymentSummary,
              paymentSummaryKeys: campaigns[0].paymentSummary
                ? Object.keys(campaigns[0].paymentSummary)
                : [],
            }
          : null,
      });
  }, [campaigns, round.roundCampaigns, isAdmin]);

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4">
      {campaigns.map((campaign) => {
        const isOwnCampaign = campaign.creatorAddress === address;

        if (isAdmin) {
          return (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              type="round"
              round={round}
              statusIndicators={
                <RoundCardCampaignStatus campaign={campaign} round={round} />
              }
              roundAdminFooterControls={
                <RoundCampaignAdminControls campaign={campaign} round={round} />
              }
            />
          );
        }

        // For regular users: show status for their own campaigns
        if (isOwnCampaign) {
          return (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              type="round"
              round={round}
              statusIndicators={
                <RoundCardCampaignStatus campaign={campaign} round={round} />
              }
              displayOptions={{
                showRoundAdminControls: false, // No admin controls for regular users
                showRoundAdminFooterControls: false, // No admin footer controls
              }}
            />
          );
        }

        // For other users' approved campaigns: standard display without status
        return (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            type="standard"
            displayOptions={{
              useCardImage: true,
              showCategoryBadge: false,
              layoutVariant: 'compact',
            }}
          />
        );
      })}
    </div>
  );
}
