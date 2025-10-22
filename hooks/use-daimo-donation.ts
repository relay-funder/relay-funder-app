import { useCallback } from 'react';
import { useAuth } from '@/contexts';
import { type DbCampaign } from '@/types/campaign';
import { useCreatePayment } from '@/lib/hooks/usePayments';
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
  const { mutateAsync: createPayment } = useCreatePayment();

  const poolAmount = parseFloat(amount) || 0;

  const onPaymentStarted = useCallback(
    async (event: DaimoPayEvent) => {
      debug && console.log('Daimo Pay: Payment started', event);

      if (!authenticated) {
        console.error('Daimo Pay: User not authenticated');
        throw new Error('Not signed in');
      }

      // Extract Daimo payment ID - this will be used to match webhooks
      const daimoPaymentId =
        event?.payment?.id || event?.id || event?.paymentId;
      if (!daimoPaymentId) {
        console.error('Daimo Pay: Missing payment ID in event');
        throw new Error('Daimo Pay event missing payment ID');
      }

      // Create payment record when payment starts
      try {
        const result = await createPayment({
          amount: amount,
          poolAmount,
          token: selectedToken,
          campaignId: campaign.id,
          isAnonymous: isAnonymous,
          status: 'confirming',
          transactionHash: daimoPaymentId,
          userEmail,
          provider: 'daimo',
        });

        debug &&
          console.log('Daimo Pay payment record created:', result.paymentId);

        return { paymentId: result.paymentId, daimoPaymentId };
      } catch (paymentError) {
        console.error('Daimo Pay: Payment creation failed:', paymentError);
        throw new Error(
          `Payment record creation failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`,
        );
      }
    },
    [
      authenticated,
      createPayment,
      amount,
      poolAmount,
      selectedToken,
      campaign.id,
      isAnonymous,
      userEmail,
    ],
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
