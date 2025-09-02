import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { CampaignItemProps } from '@/types/campaign';
import { FavoriteButton } from '@/components/favorite-button';
import { categories } from '@/lib/constant';
import { Badge } from '@/components/ui/badge';
import { FormattedDate } from '../formatted-date';
import { CampaignMainImage } from './main-image';
import { CampaignDashboardStatus } from './dashboard-status';
import { CampaignProgress } from './progress';
import { UserInlineName } from '../user/inline-name';
import { CampaignLocation } from './location';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CampaignRemoveButton } from './remove-button';

export function CampaignCardDashboard({
  campaign,
  isFavorite,
  onFavoriteToggle,
  onCreate,
}: CampaignItemProps) {
  const session = useSession();
  const categoryDetails = campaign?.category
    ? categories.find((category) => category.id === campaign.category)
    : null;
  if (!campaign) {
    return (
      <Card
        className="flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-lg"
        onClick={onCreate}
      >
        <CardHeader className="relative p-0">
          <CampaignMainImage campaign={campaign} />
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="mb-2 line-clamp-1 text-xl font-bold">
              Create Campaign
            </h2>
          </div>
          <div className="space-y-2">
            <div className="mb-2 flex items-center justify-between gap-1">
              <div className="align flex gap-2 self-start">
                <UserInlineName user={session.data?.user} />
              </div>
              <CampaignLocation />
            </div>
            <p className="line-clamp-3 text-[12px] text-gray-600">
              To fund your project, create a campaign now.
            </p>
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
          <div className="w-full flex-1 space-y-2 py-4">
            <CampaignProgress />
          </div>
        </CardFooter>
      </Card>
    );
  }
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="relative p-0">
        <CampaignMainImage campaign={campaign} />
        {typeof onFavoriteToggle === 'function' && (
          <div className="absolute right-4 top-4 z-10">
            <FavoriteButton
              campaignId={campaign.id}
              initialIsFavorite={isFavorite}
              onToggle={onFavoriteToggle}
            />
          </div>
        )}
        <div className="absolute right-4 top-16 z-10">
          <CampaignRemoveButton campaign={campaign} />
        </div>
        <div className="absolute left-4 top-4 z-10">
          <CampaignDashboardStatus campaign={campaign} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className="mb-2 line-clamp-1 text-sm font-bold md:text-xl"
              title={campaign?.title ?? 'No Title Set'}
            >
              {campaign?.title ?? 'Campaign Title'}
            </h2>
            {categoryDetails && (
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <span>{categoryDetails.icon}</span>
                <span className="text-xs">{categoryDetails.name}</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="align flex gap-2 self-start">
              <UserInlineName user={campaign?.creator} />
            </div>
            <CampaignLocation campaign={campaign} />
          </div>
          <p className="line-clamp-3 text-[12px] text-gray-600">
            {campaign?.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="mb-4 cursor-pointer items-center gap-2 text-[14px] text-black underline decoration-black hover:text-gray-600">
              {campaign?.status !== 'CREATING' ? (
                <Link href={`/campaigns/${campaign?.slug}`} target="_blank">
                  Read More
                </Link>
              ) : (
                <>Read More</>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
        <div className="w-full flex-1 space-y-2 py-4">
          {campaign.startTime && (
            <p>
              <strong>Launch:</strong>{' '}
              <FormattedDate date={campaign.startTime} />
            </p>
          )}
          {campaign.endTime && (
            <p>
              <strong>Deadline:</strong>{' '}
              <FormattedDate date={campaign.endTime} />
            </p>
          )}
          <CampaignProgress campaign={campaign} />
        </div>
      </CardFooter>
    </Card>
  );
}
