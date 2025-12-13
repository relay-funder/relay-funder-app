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
import { NewsletterSignupLink } from '@/components/newsletter/newsletter-signup-link';

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
        } else {
          setStatus('error');
          setMessage('Payment was not completed successfully');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setStatus('error');
        setMessage(
          err instanceof Error
            ? err.message
            : 'Failed to verify payment status',
        );
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className="flex items-start justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md space-y-6 p-8">
        {status === 'loading' ? (
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
            <p className="mt-4 text-muted-foreground">
              Verifying payment status...
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-bio" />
            <h1 className="text-2xl font-bold text-foreground">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex justify-center">
              <NewsletterSignupLink />
            </div>
            <Link href="/" className="block">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">
              Payment Failed
            </h1>
            <p className="text-muted-foreground">{message}</p>
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
