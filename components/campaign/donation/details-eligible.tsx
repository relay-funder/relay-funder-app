import { Campaign } from '@/types/campaign';
import { Badge } from '@/components/ui';
export function CampaignDonationDetailsEligible({
  campaign,
}: {
  campaign: Campaign;
}) {
  if (!campaign.treasuryAddress) {
    return null;
  }
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className="bg-teal-50 text-teal-600 hover:bg-teal-50"
      >
        <span className="mr-1">👋</span> Eligible for matching
      </Badge>
    </div>
  );
}
