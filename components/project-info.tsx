'use client';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { ZeroFeePromise } from '@/components/zero-fee-promise';
import { FormattedDate } from './formatted-date';
import { UserInlineName } from './user/inline-name';
import { useCampaignStats } from '@/hooks/use-campaign-stats';
import { CampaignProgress } from './campaign/progress';
import { CampaignDaysLeftBlock } from './campaign/days-left-block';
import { CampaignMainImage } from './campaign/main-image';
import { CampaignLoading } from './campaign/loading';
import { CampaignDashboardStatus } from './campaign/dashboard-status';
import type { DbCampaign } from '@/types/campaign';

export default function ProjectInfo({ campaign }: { campaign?: DbCampaign }) {
  const { contributorCount } = useCampaignStats({
    slug: campaign?.slug ?? '',
  });
  const hasContributors = contributorCount > 0;
  const lastConfirmed = campaign?.paymentSummary?.lastConfirmed;
  const lastPending = campaign?.paymentSummary?.lastPending;

  if (!campaign) {
    return <CampaignLoading expectItemCount={1} />;
  }

  return (
    <div className="space-y-4">
      <Card className="w-fit overflow-hidden">
        <CardHeader className="relative p-0">
          <CampaignMainImage campaign={campaign} />
          <div className="absolute pl-1">
            <CampaignDashboardStatus campaign={campaign} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between gap-3">
              <h1 className="pt-4 text-xl font-semibold text-pink-500">
                {campaign.title}
              </h1>
              <div className="pt-4 align-middle text-sm font-semibold">
                <UserInlineName
                  user={campaign?.creator}
                  badges={true}
                  prefix="By"
                />
              </div>
            </div>
            <div className="flex flex-row items-center gap-3">
              <CampaignProgress campaign={campaign} className="flex-grow" />
              <CampaignDaysLeftBlock
                campaign={campaign}
                className="align-middle"
              />
            </div>

            <div className="items-top flex flex-row gap-3">
              {hasContributors && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    {contributorCount.toLocaleString()} Contributors
                  </div>

                  {lastConfirmed && (
                    <div className="text-sm font-bold">
                      <UserInlineName user={lastConfirmed.user} />
                      donated {lastConfirmed.amount.toLocaleString()}{' '}
                      {lastConfirmed.token ?? '$'}{' '}
                      {lastConfirmed.date && (
                        <FormattedDate date={lastConfirmed.date} />
                      )}
                    </div>
                  )}
                  {lastPending && (
                    <div className="text-sm font-bold text-muted-foreground">
                      <UserInlineName user={lastPending.user} />
                      donating {lastPending.amount.toLocaleString()}{' '}
                      {lastPending.token ?? '$'}{' '}
                      {lastPending.date && (
                        <FormattedDate date={lastPending.date} />
                      )}
                    </div>
                  )}
                </div>
              )}
              <ZeroFeePromise />
            </div>

            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
