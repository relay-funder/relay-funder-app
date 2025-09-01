import { useMemo } from 'react';

export function CampaignDaysLeft({
  campaign,
}: {
  campaign: { endTime: string | Date };
}) {
  const daysLeft = useMemo(() => {
    if (!campaign?.endTime) {
      return 0;
    }
    const now = new Date();
    const endDate = new Date(campaign.endTime);
    return Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [campaign?.endTime]);

  return `${daysLeft}`;
}
