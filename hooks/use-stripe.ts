import { useMemo, useState, useCallback } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { type Stripe } from '@stripe/stripe-js';

import { enableApiMock } from '@/lib/fetch';
import { mockStripeInstance } from '@/lib/test/mock-stripe';

export function useStripeIsReady() {
  const stripe = useStripe();
  const elements = useElements();
  const isReady = useMemo(() => {
    return stripe && elements ? true : false;
  }, [stripe, elements]);

  return isReady;
}

export function useStripePaymentCallback({ amount }: { amount: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [stripeData, setStripeData] = useState<{
    clientSecret: string;
    publicKey: string;
  } | null>(null);
  const onStripePayment = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Get access token
      const tokenResponse = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_CROWDSPLIT_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_CROWDSPLIT_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.message || 'Failed to get access token');
      }
      const { access_token } = await tokenResponse.json();

      // Create customer
      const customerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_CROWDSPLIT_API_URL}/api/v1/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({ email: 'user@example.com' }), // TODO: Get user email
        },
      );

      if (!customerResponse.ok) {
        const error = await customerResponse.json();
        throw new Error(error.message || 'Failed to create customer');
      }
      const {
        data: { id: customerId },
      } = await customerResponse.json();

      // Initialize payment
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_CROWDSPLIT_API_URL}/api/v1/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(amount) * 100, // Convert to cents
            customer_id: customerId,
            currency: 'USD',
            payment_method: 'CARD',
            provider: 'STRIPE',
          }),
        },
      );

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.message || 'Failed to initialize payment');
      }
      const {
        data: { id: transactionId },
      } = await paymentResponse.json();

      // Confirm payment
      const confirmResponse = await fetch(
        `${process.env.NEXT_PUBLIC_CROWDSPLIT_API_URL}/api/v1/payments/${transactionId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.message || 'Failed to confirm payment');
      }
      const {
        data: { metadata },
      } = await confirmResponse.json();

      // Initialize Stripe with the public key from Crowdsplit
      setStripeData({
        clientSecret: metadata.client_secret,
        publicKey: metadata.public_key,
      });
      if (enableApiMock) {
        setStripePromise(
          new Promise((resolve) =>
            setTimeout(() => resolve(mockStripeInstance), 1000),
          ),
        );
      } else {
        setStripePromise(loadStripe(metadata.public_key));
      }
    } catch (err) {
      console.error('Card payment error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to process card payment',
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);
  return { onStripePayment, isProcessing, error, stripeData, stripePromise };
}
