import { useCallback } from 'react';
import { useAuth } from '@/contexts';
import { type DbCampaign } from '@/types/campaign';
import {
  useCreatePayment,
  useUpdatePaymentStatus,
} from '@/lib/hooks/usePayments';
import { debugHook as debug } from '@/lib/debug';

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
  const { mutateAsync: updatePaymentStatus } = useUpdatePaymentStatus();

  const poolAmount = parseFloat(amount) || 0;

  const onPaymentStarted = useCallback(
    async (event: any) => {
      debug && console.log('Daimo Pay: Payment started', event);

      if (!authenticated) {
        throw new Error('Not signed in');
      }

      // Extract Daimo payment ID - this will be used to match webhooks
      const daimoPaymentId = event?.id || event?.paymentId;
      if (!daimoPaymentId) {
        throw new Error('Daimo Pay event missing payment ID');
      }

      // Create payment record when payment starts
      debug && console.log('Creating Daimo Pay payment record...');
      const { paymentId } = await createPayment({
        amount: amount,
        poolAmount,
        token: selectedToken,
        campaignId: campaign.id,
        isAnonymous: isAnonymous,
        status: 'confirming',
        transactionHash: daimoPaymentId, // Use Daimo payment ID as transaction hash for webhook matching
        userEmail,
      });

      debug &&
        console.log(
          'Daimo Pay payment record created with ID:',
          paymentId,
          'for Daimo payment:',
          daimoPaymentId,
        );

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

  const onPaymentCompleted = useCallback(async (event: any) => {
    debug && console.log('Daimo Pay: Payment completed', event);

    // Payment status will be updated via webhook
    // This callback is mainly for UI feedback and analytics
    debug &&
      console.log(
        'Payment completion acknowledged - status update via webhook',
      );
  }, []);

  const onPaymentBounced = useCallback(async (event: any) => {
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
