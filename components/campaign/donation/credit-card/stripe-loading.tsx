import { Card, CardContent } from '@/components/ui';
export function CampaignDonationCreditCardStripeLoading() {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="animate-pulse space-y-4">
        <div className="h-6 w-1/2 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-20 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-16 rounded bg-gray-200"></div>
      </CardContent>
    </Card>
  );
}
