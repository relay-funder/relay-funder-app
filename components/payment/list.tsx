import { type DbCampaign } from '@/types/campaign';
import { PaymentItem } from './item';
import { PaymentEmpty } from './empty';
import { useCampaignPayments } from '@/lib/hooks/useCampaigns';
export function PaymentList({ campaign }: { campaign: DbCampaign }) {
  const { data: payments, isPending } = useCampaignPayments({
    id: campaign.id,
  });
  if (isPending || !Array.isArray(payments)) {
    <PaymentEmpty />;
  }
  return (
    <div className="space-y-4">
      {payments?.map((payment, index) => (
        <PaymentItem key={`${index}${payment.date}`} payment={payment} />
      ))}
    </div>
  );
}
