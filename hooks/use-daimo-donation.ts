import { useCallback } from 'react';
import { useAuth } from '@/contexts';
import { type DbCampaign } from '@/types/campaign';
import { debugHook as debug } from '@/lib/debug';

interface DaimoPayEvent {
  id?: string;
  paymentId?: string;
  payment?: {
    id: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Hook for Daimo Pay donation callbacks.
 *
 * NOTE: Payment record creation has been moved to the webhook handler.
 * The client no longer creates payment records to avoid race conditions
 * between payment creation and Daimo settlement.
 *
 * Flow:
 * 1. User initiates payment via Daimo
 * 2. onPaymentStarted: Log payment ID only (no DB write)
 * 3. Webhook receives payment_started: Creates payment record
 * 4. Webhook receives payment_completed: Updates payment and executes pledge
 */
export function useDaimoDonationCallback({
  campaign,
  amount,
  tipAmount = '0',
  selectedToken,
  isAnonymous = false,
  userEmail,
}: {
  campaign: DbCampaign;
  amount: string;
  tipAmount?: string;
  selectedToken: string;
  isAnonymous?: boolean;
  userEmail?: string;
}) {
  const { authenticated } = useAuth();

  const onPaymentStarted = useCallback(
    async (event: DaimoPayEvent) => {
      debug && console.log('Daimo Pay: Payment started', event);

      if (!authenticated) {
        console.error('Daimo Pay: User not authenticated');
        throw new Error('Not signed in');
      }

      // Extract Daimo payment ID for logging/tracking
      const daimoPaymentId =
        event?.payment?.id || event?.id || event?.paymentId;
      if (!daimoPaymentId) {
        console.error('Daimo Pay: Missing payment ID in event');
        throw new Error('Daimo Pay event missing payment ID');
      }

      debug &&
        console.log('Daimo Pay: Payment ID extracted:', daimoPaymentId);
      debug &&
        console.log(
          'Daimo Pay: Payment record will be created by webhook (payment_started event)',
        );

      // Return payment ID for UI tracking only
      // No database write happens here - webhook handles it
      return { daimoPaymentId };
    },
    [authenticated],
  );

  const onPaymentCompleted = useCallback(async (event: DaimoPayEvent) => {
    debug && console.log('Daimo Pay: Payment completed', event);

    // Payment status will be updated via webhook
    // This callback is mainly for UI feedback and analytics
    debug &&
      console.log(
        'Payment completion acknowledged - status update via webhook',
      );
  }, []);

  const onPaymentBounced = useCallback(async (event: DaimoPayEvent) => {
    debug && console.log('Daimo Pay: Payment bounced', event);

    // Payment status will be updated via webhook
    // This callback is mainly for UI feedback and analytics
    debug &&
      console.log('Payment bounce acknowledged - status update via webhook');
  }, []);

  return {
    onPaymentStarted,
    onPaymentCompleted,
    onPaymentBounced,
  };
}
