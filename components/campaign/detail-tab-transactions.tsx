import { CampaignDisplay } from '@/types/campaign';
import { PaymentList } from '@/components/payment/list';
import { PaymentEmpty } from '@/components/payment/empty';

export function CampaignDetailTabTransactions({
  campaign,
}: {
  campaign: CampaignDisplay;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transaction History</h2>
      <p className="text-gray-600">
        All donations to this campaign are listed here.
      </p>

      {campaign.payments && campaign.payments.length > 0 ? (
        <PaymentList payments={campaign.payments} />
      ) : (
        <PaymentEmpty />
      )}
    </div>
  );
}
