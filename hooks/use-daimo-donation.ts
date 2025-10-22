import { useCallback } from 'react';
import { useAuth } from '@/contexts';
import { type DbCampaign } from '@/types/campaign';
import { useCreatePayment } from '@/lib/hooks/usePayments';
import { debugHook as debug } from '@/lib/debug';

interface DaimoPayEvent {
  id?: string;
  paymentId?: string;
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
      console.log('🚀 Daimo Pay: onPaymentStarted callback triggered');
      debug && console.log('Daimo Pay: Payment started', event);

      if (!authenticated) {
        console.error(
          '🚨 Daimo Pay: User not authenticated, cannot create payment',
        );
        throw new Error('Not signed in');
      }

      // Extract Daimo payment ID - this will be used to match webhooks
      const daimoPaymentId =
        event?.payment?.id || event?.id || event?.paymentId;
      if (!daimoPaymentId) {
        console.error(
          'Daimo Pay event missing payment ID. Event structure:',
          JSON.stringify(event, null, 2),
        );
        throw new Error('Daimo Pay event missing payment ID');
      }

      // Create payment record when payment starts
      console.log(
        '🚀 Daimo Pay: Creating payment record with daimoPaymentId:',
        daimoPaymentId,
      );
      debug && console.log('Creating Daimo Pay payment record...');
      let paymentId: number | undefined;
      try {
        const result = await createPayment({
          amount: amount,
          poolAmount,
          token: selectedToken,
          campaignId: campaign.id,
          isAnonymous: isAnonymous,
          status: 'confirming',
          transactionHash: daimoPaymentId, // Use Daimo payment ID as transaction hash for webhook matching
          userEmail,
        });
        paymentId = result.paymentId;

        console.log(
          '✅ Daimo Pay: Payment record created successfully with ID:',
          paymentId,
        );
        debug &&
          console.log(
            'Daimo Pay payment record created with ID:',
            paymentId,
            'for Daimo payment:',
            daimoPaymentId,
          );
      } catch (paymentError) {
        console.error(
          '🚨 Daimo Pay: Failed to create payment record:',
          paymentError,
        );
        console.error('🚨 Daimo Pay: Payment creation params:', {
          amount,
          poolAmount,
          token: selectedToken,
          campaignId: campaign.id,
          isAnonymous,
          status: 'confirming',
          transactionHash: daimoPaymentId,
          userEmail,
        });
        // Re-throw the error to prevent Daimo Pay from continuing
        throw new Error(
          `Payment record creation failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`,
        );
      }

      return { paymentId, daimoPaymentId };
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
