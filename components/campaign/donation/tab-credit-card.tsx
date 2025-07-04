import { Elements } from '@stripe/react-stripe-js';
import { PaymentStripeForm } from '@/components/payment/stripe-form';
import { CreditCard } from 'lucide-react';
import { useStripePaymentCallback } from '@/hooks/use-stripe';
import { Campaign } from '@/types/campaign';

export function CampaignDonationTabCreditCard({
  amount,
  campaign,
}: {
  amount: string;
  campaign: Campaign;
}) {
  const {
    onStripePayment,
    error: stripeError,
    isProcessing: isStripeProcessing,
    stripeData,
    stripePromise,
  } = useStripePaymentCallback({
    amount,
  });
  return (
    <>
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        <span className="text-sm">Secure payment via Stripe</span>
      </div>
      {stripeData && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: stripeData.clientSecret,
            appearance: { theme: 'stripe' },
          }}
        >
          <PaymentStripeForm
            publicKey={stripeData.publicKey}
            campaign={campaign}
            amount={amount}
          />
        </Elements>
      )}
    </>
  );
}
