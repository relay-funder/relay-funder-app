import { type DbCampaign } from '@/types/campaign';
import { PaymentList } from '@/components/payment/list';
import { PaymentEmpty } from '@/components/payment/empty';

export function CampaignDetailTabTransactions({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  return (
    <div className="w-full max-w-3xl space-y-4 sm:space-y-6">
      {(campaign.paymentSummary?.countConfirmed ?? 0) > 0 ? (
        <PaymentList campaign={campaign} />
      ) : (
        <PaymentEmpty />
      )}
    </div>
  );
}
