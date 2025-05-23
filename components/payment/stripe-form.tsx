import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Campaign } from '@/types/campaign';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui';
import type {
  StripePaymentElementOptions,
  StripePaymentElementChangeEvent,
} from '@stripe/stripe-js';
import { useStripeIsReady } from '@/hooks/use-stripe';

const debug = process.env.NODE_ENV !== 'production';
export function PaymentStripeForm({
  publicKey,
  campaign,
  userAddress,
  amount,
}: {
  publicKey: string;
  campaign: Campaign;
  userAddress: string | null;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const isReady = useStripeIsReady();

  debug &&
    console.log('Stripe form props:', {
      publicKey,
      campaign,
      userAddress,
      amount,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      return;
    }

    // Prevent multiple form submissions
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred');
        return;
      }

      const returnUrl = new URL(
        `${window.location.origin}/campaigns/${campaign.slug}/donation/success`,
      );
      returnUrl.searchParams.append('stripe_key', publicKey);

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
      });
      const { error } = result;

      // Debug: log the full Stripe result
      debug && console.log('Stripe confirmPayment result:', result);

      if (error) {
        // Prefer the most specific error message from Stripe
        let displayMessage = error.message || 'An error occurred';
        if (
          error.payment_intent &&
          error.payment_intent.last_payment_error &&
          error.payment_intent.last_payment_error.message
        ) {
          displayMessage = error.payment_intent.last_payment_error.message;
        }
        setError(displayMessage);
        console.error('Stripe confirmPayment error:', error);
        toast({
          title: 'Error',
          description: displayMessage,
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setIsProcessing(false);
    }
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
    <form onSubmit={handleSubmit} id="payment-form">
      <div id="payment-element">
        <PaymentElement
          options={
            {
              layout: 'accordion',
              defaultValues: {
                billingDetails: {
                  name: 'John Doe', // test user name
                  email: 'user@example.com', // test user email
                },
              },
            } as StripePaymentElementOptions
          }
          onChange={(event: StripePaymentElementChangeEvent) => {
            if (event.complete) {
              setError(null);
            } else if (event.empty) {
              setError('Please enter payment details');
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
        disabled={!stripe || isProcessing || !isReady}
        className="mt-4 w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  );
}
