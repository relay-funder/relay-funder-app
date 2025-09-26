'use client';
import { useRouter } from 'next/navigation';
import { PageHome } from '@/components/page/home';
import { Button } from '@/components/ui/button'; // Assuming a Button component exists, adjust if needed
import { FormattedDate } from '../formatted-date';

interface NotStartedYetProps {
  campaign: {
    slug: string;
    startTime: string | number | Date;
  };
}

export function NotStartedYet({ campaign }: NotStartedYetProps) {
  const router = useRouter();

  const handleBackToCampaign = () => {
    router.push(`/campaigns/${campaign.slug}`);
  };

  return (
    <PageHome header="">
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-2xl font-bold">Campaign Not Yet Active</h1>
        <p className="mb-6 text-lg">
          This campaign is scheduled to start on{' '}
          <FormattedDate date={new Date(campaign.startTime)} />. Please check
          back then to make a donation.
        </p>
        <Button onClick={handleBackToCampaign} variant="default">
          Back to Campaign Page
        </Button>
      </div>
    </PageHome>
  );
}
