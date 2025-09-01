import { type DbCampaign } from '@/types/campaign';
import { PaymentList } from '@/components/payment/list';
import { PaymentEmpty } from '@/components/payment/empty';

export function CampaignDetailTabTransactions({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transaction History</h2>
      <p className="text-gray-600">
        All confirmed donations to this campaign are listed here.
      </p>

      {(campaign.paymentSummary?.countConfirmed ?? 0) > 0 ? (
        <PaymentList campaign={campaign} />
      ) : (
        <PaymentEmpty />
      )}
    </div>
  );
}
