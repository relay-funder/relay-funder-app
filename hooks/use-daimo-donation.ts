import { useCallback } from 'react';
import { useAuth } from '@/contexts';
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
 * Flow:
 * 1. User initiates payment via Daimo
 * 2. onPaymentStarted: Extract payment ID for UI tracking
 * 3. Webhook creates and confirms payment record
 * 4. Webhook executes pledge on-chain
 *
 * Note: Payment metadata (campaign, amount, tip) is passed to Daimo SDK separately.
 * This hook only provides event callbacks for UI state management.
 */
export function useDaimoDonationCallback() {
  const { authenticated } = useAuth();

  const onPaymentStarted = useCallback(
    async (event: DaimoPayEvent) => {
      debug && console.log('Daimo Pay: Payment started', event);

      if (!authenticated) {
        console.warn(
          'Daimo Pay: User not authenticated when payment started; webhook will still reconcile by payer address',
        );
      }

      // Extract Daimo payment ID for logging/tracking
      const daimoPaymentId =
        event?.payment?.id || event?.id || event?.paymentId;
      if (!daimoPaymentId) {
        console.error('Daimo Pay: Missing payment ID in event');
        return;
      }

      debug && console.log('Daimo Pay: Payment ID extracted:', daimoPaymentId);

      // Return payment ID for UI tracking
      return { daimoPaymentId };
    },
    [authenticated],
  );

  const onPaymentCompleted = useCallback(async (event: DaimoPayEvent) => {
    debug && console.log('Daimo Pay: Payment completed', event);
  }, []);

  const onPaymentBounced = useCallback(async (event: DaimoPayEvent) => {
    debug && console.log('Daimo Pay: Payment bounced', event);
  }, []);

  return {
    onPaymentStarted,
    onPaymentCompleted,
    onPaymentBounced,
  };
}
