import { DbCampaign } from '@/types/campaign';
import { Badge } from '@/components/ui';
export function CampaignDonationDetailsEligible({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  if (!campaign.treasuryAddress) {
    return null;
  }
  return (
    <Badge
      variant="secondary"
      className="bg-teal-50 text-teal-600 hover:bg-teal-50"
    >
      <span className="mr-1">👋</span> Eligible for matching
    </Badge>
  );
}
