'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { enableApiMock } from '@/lib/develop';
import { mockStripeInstance } from '@/lib/test/mock-stripe';
import { trackEvent } from '@/lib/analytics';

export function PaymentStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) {
      return;
    }

    const clientSecret = searchParams.get('payment_intent_client_secret');
    const paymentIntentId = searchParams.get('payment_intent');
    const stripeKey = searchParams.get('stripe_key');

    if (!clientSecret || !paymentIntentId || !stripeKey) {
      console.error('bad search params', searchParams, {
        clientSecret,
        paymentIntentId,
        stripeKey,
      });
      setStatus('error');
      setMessage('Invalid payment session');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        let stripe = undefined;
        if (enableApiMock) {
          stripe = mockStripeInstance;
        } else {
          stripe = await loadStripe(stripeKey);
        }
        if (!stripe) throw new Error('Failed to load Stripe');

        const result = await stripe.retrievePaymentIntent(clientSecret);
        if (result.error) {
          setStatus('error');
          setMessage(result.error.message || 'Failed to verify payment status');
          return;
        }
        const { paymentIntent } = result;

        if (paymentIntent?.status === 'succeeded') {
          setStatus('success');
          setMessage('Thank you for your donation!');
          trackEvent('funnel_payment_success', {
            amount: paymentIntent.amount / 100, // Stripe amount is in cents
            currency: paymentIntent.currency,
            payment_method: paymentIntent.payment_method_types?.[0],
            session_id: paymentIntentId,
          });
        } else {
          setStatus('error');
          setMessage('Payment was not completed successfully');
          trackEvent('funnel_payment_failed', {
            error_message: 'Payment status not succeeded',
            session_id: paymentIntentId,
          });
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setStatus('error');
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to verify payment status';
        setMessage(errorMessage);
        trackEvent('funnel_payment_failed', {
          error_message: errorMessage,
        });
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className="flex items-start justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md space-y-4 p-6">
        {status === 'loading' ? (
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-4">Verifying payment status...</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold text-green-700">
              Payment Successful!
            </h1>
            <p className="text-gray-600">{message}</p>
            <Link href="/" className="block">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold text-red-700">Payment Failed</h1>
            <p className="text-gray-600">{message}</p>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
