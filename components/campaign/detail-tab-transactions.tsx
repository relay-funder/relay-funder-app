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
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <p className="text-sm text-gray-600">
          All confirmed donations to this campaign are listed here.
        </p>
      </div>

      <div className="rounded-md border bg-gray-50">
        {(campaign.paymentSummary?.countConfirmed ?? 0) > 0 ? (
          <PaymentList campaign={campaign} />
        ) : (
          <div className="p-6">
            <PaymentEmpty />
          </div>
        )}
      </div>
    </div>
  );
}
