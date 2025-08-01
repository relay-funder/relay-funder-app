import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type DbCampaign } from '@/types/campaign';
import { FavoriteButton } from '@/components/favorite-button';
import { categories } from '@/lib/constant';
import { Badge } from '@/components/ui/badge';
import { FormattedDate } from '../formatted-date';
import { CampaignMainImage } from './main-image';
import { CampaignDashboardStatus } from './dashboard-status';
import { CampaignProgress } from './progress';

interface CampaignCardDashboardProps {
  campaign: DbCampaign;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

export function CampaignCardDashboard({
  campaign,
  isFavorite,
  onFavoriteToggle,
}: CampaignCardDashboardProps) {
  // Find the category details
  const categoryDetails = campaign.category
    ? categories.find((cat) => cat.id === campaign.category)
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative p-0">
        <CampaignMainImage campaign={campaign} />
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton
            campaignId={campaign.id}
            initialIsFavorite={isFavorite}
            onToggle={onFavoriteToggle}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold"></h2>
            {categoryDetails && (
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <span>{categoryDetails.icon}</span>
                <span className="text-xs">{categoryDetails.name}</span>
              </Badge>
            )}
          </div>
          <CampaignDashboardStatus campaign={campaign} />
        </div>

        <div className="space-y-2">
          <p className="line-clamp-3">
            <strong>Description:</strong> {campaign.description}
          </p>
          {campaign.treasuryAddress && (
            <p>
              <strong>Treasury:</strong> {campaign.treasuryAddress}
            </p>
          )}
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
      </CardContent>
    </Card>
  );
}
