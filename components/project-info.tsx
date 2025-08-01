'use client';

import { Card, CardContent } from '@/components/ui';
import { ZeroFeePromise } from '@/components/zero-fee-promise';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { GetCampaignResponse } from '@/lib/api/types';
import { FormattedDate } from './formatted-date';
import { UserInlineName } from './user/inline-name';
import { UserInlineBadges } from './user/inline-badges';
import { useCampaignStats } from '@/hooks/use-campaign-stats';
import { CampaignProgress } from './campaign/progress';
import { CampaignDaysLeftBlock } from './campaign/days-left-block';
import { CampaignMainImage } from './campaign/main-image';
import { CampaignLoading } from './campaign/loading';

interface ProjectInfoProps {
  slug: string;
}

export default function ProjectInfo({ slug }: ProjectInfoProps) {
  const { data, isPending } = useCampaign(slug);
  const { campaign } = data ?? ({} as GetCampaignResponse);
  const { contributorCount } = useCampaignStats({
    slug,
  });
  const hasContributors = contributorCount > 0;
  const lastConfirmed = campaign?.paymentSummary?.lastConfirmed;
  const lastPending = campaign?.paymentSummary?.lastPending;

  if (isPending || !campaign) {
    return <CampaignLoading expectItemCount={1} />;
  }

  return (
    <div className="space-y-4">
      <Card className="w-fit overflow-hidden">
        <div className="relative">
          <CampaignMainImage campaign={campaign} />
        </div>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between gap-3">
              <h1 className="text-xl font-semibold text-pink-500">
                {campaign.title}
              </h1>
              <div className="">
                By
                <UserInlineBadges user={campaign?.creator} />
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
