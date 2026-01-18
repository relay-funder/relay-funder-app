import { type DbCampaign } from '@/types/campaign';
import { PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui';
import type {
  StripePaymentElementOptions,
  StripePaymentElementChangeEvent,
} from '@stripe/stripe-js';
import { useStripeFormSubmission } from '@/hooks/use-stripe-form-submission';

interface PaymentStripeFormProps {
  publicKey: string;
  campaign: DbCampaign;
  amount: string;
}

/**
 * Main Stripe payment form component
 * Handles user interaction with Stripe Elements and form rendering
 */
export function PaymentStripeForm({
  publicKey,
  campaign,
}: PaymentStripeFormProps) {
  const { error, isProcessing, isReady, handleSubmit, clearError } =
    useStripeFormSubmission({
      publicKey,
      campaign,
    });

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
  };

  if (!isReady) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-600">Loading payment form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} id="payment-form">
      <div id="payment-element">
        <PaymentElement
          options={
            {
              layout: 'accordion',
            } as StripePaymentElementOptions
          }
          onChange={(event: StripePaymentElementChangeEvent) => {
            if (event.complete) {
              clearError();
            } else if (event.empty) {
              // Don't set error for empty state - let user fill form naturally
            }
          }}
        />
      </div>
      {error && (
        <div id="error-message" className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
      <Button
        id="submit"
        type="submit"
        disabled={isProcessing || !isReady}
        className="mt-4 w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  );
}
