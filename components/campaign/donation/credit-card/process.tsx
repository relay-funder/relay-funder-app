import { useMemo, Suspense } from 'react';
import { CreditCard } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { LazyStripeForm } from '@/components/payment/stripe-form-lazy';
import { CampaignDonationCreditCardStripeLoading } from './stripe-loading';
import { DEFAULT_USER_EMAIL } from '@/lib/constant';
import { useStripeLazy } from '@/hooks/use-stripe-lazy';
import { Button } from '@/components/ui';
export function CampaignDonationCreditCardProcess({
  campaign,
  amount,
  donationToAkashic,
  anonymous,
}: {
  campaign: Campaign;
  amount: string;
  donationToAkashic: number;
  anonymous: boolean;
}) {
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const akashicAmount = useMemo(() => {
    if (donationToAkashic) {
      return (numericAmount * donationToAkashic) / 100;
    }
    return 0;
  }, [numericAmount, donationToAkashic]);
  const poolAmount = useMemo(() => {
    return numericAmount - akashicAmount;
  }, [numericAmount, akashicAmount]);

  // Lazy Stripe implementation - no API calls until donate button clicked
  const { isProcessing, stripeData, stripePromise, createPaymentIntent } =
    useStripeLazy({
      amount,
      poolAmount,
      campaign,
      userEmail: DEFAULT_USER_EMAIL, // TODO: Get actual user email from session or profile
      isAnonymous: anonymous,
    });
  return (
    <>
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        <span className="text-sm">Secure payment via Stripe</span>
      </div>
      {stripeData && stripePromise && (
        <Suspense fallback={<CampaignDonationCreditCardStripeLoading />}>
          <LazyStripeForm
            stripePromise={stripePromise}
            clientSecret={stripeData.clientSecret}
            publicKey={stripeData.publicKey}
            campaign={campaign}
            amount={amount}
          />
        </Suspense>
      )}
      <Button
        className="w-full"
        size="lg"
        disabled={!numericAmount || isProcessing}
        onClick={createPaymentIntent}
      >
        {isProcessing ? 'Processing...' : `Donate with Card`}
      </Button>
    </>
  );
}
