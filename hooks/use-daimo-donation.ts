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
      console.log(
        '🚀 Daimo Pay: useDaimoDonationCallback.onPaymentStarted triggered',
      );
      console.log(
        '🚀 Daimo Pay: Full event structure:',
        JSON.stringify(event, null, 2),
      );
      console.log(
        '🚀 Daimo Pay: Hook params - authenticated:',
        authenticated,
        'userEmail:',
        userEmail,
      );
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

      // Test staging connectivity and auth
      try {
        const pingResponse = await fetch('/api/payments/ping', {
          method: 'POST',
        });
        if (pingResponse.ok) {
          const pingData = await pingResponse.json();
          console.log('✅ Staging connectivity test passed:', pingData);
        } else {
          console.error('🚨 Staging connectivity test FAILED');
        }
      } catch (pingError) {
        console.error('🚨 Cannot reach payment API:', pingError);
      }

      // Create payment record when payment starts
      let paymentId: number | undefined;
      try {
        console.log('═══════════════════════════════════════════════');
        console.log('🚀 DAIMO BUTTON CALLBACK: Starting payment creation');
        console.log('🚀 Environment:', process.env.NODE_ENV);
        console.log('🚀 Daimo Payment ID to store:', daimoPaymentId);
        console.log('🚀 Will store in field: transactionHash');
        console.log('═══════════════════════════════════════════════');

        const result = await createPayment({
          amount: amount,
          poolAmount,
          token: selectedToken,
          campaignId: campaign.id,
          isAnonymous: isAnonymous,
          status: 'confirming',
          transactionHash: daimoPaymentId, // Use Daimo payment ID as transaction hash for webhook matching
          userEmail,
          provider: 'daimo', // Add this line
        });
        paymentId = result.paymentId;

        console.log('═══════════════════════════════════════════════');
        console.log('✅ DAIMO BUTTON CALLBACK: Payment created SUCCESSFULLY');
        console.log('✅ Database Payment ID:', paymentId);
        console.log('✅ Stored transactionHash:', daimoPaymentId);
        console.log(
          '✅ Webhook should search for transactionHash =',
          daimoPaymentId,
        );
        console.log('═══════════════════════════════════════════════');

        // Verify the payment was actually saved
        const verifyResponse = await fetch(
          `/api/payments/verify?transactionHash=${encodeURIComponent(daimoPaymentId)}`,
        );
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log(
            '✅ VERIFICATION: Payment found in database immediately after creation',
          );
          console.log(
            '✅ VERIFICATION DATA:',
            JSON.stringify(verifyData, null, 2),
          );
        } else {
          console.error(
            '🚨 VERIFICATION FAILED: Payment NOT found immediately after creation!',
          );
          console.error(
            '🚨 This indicates a critical issue with payment storage',
          );
        }

        console.log('🔗 Daimo Pay: IDENTIFIER SET FOR WEBHOOK MATCHING');
        console.log('🔗 Field: transactionHash');
        console.log('🔗 Value:', daimoPaymentId);
        console.log(
          '🔗 This identifier will be used by webhook to confirm payment',
        );

        debug &&
          console.log(
            'Daimo Pay payment record created with ID:',
            paymentId,
            'for Daimo payment:',
            daimoPaymentId,
          );
      } catch (paymentError) {
        console.error('═══════════════════════════════════════════════');
        console.error('🚨 DAIMO BUTTON CALLBACK: Payment creation FAILED');
        console.error('🚨 Error:', paymentError);
        console.error(
          '🚨 Error message:',
          paymentError instanceof Error ? paymentError.message : 'Unknown',
        );
        console.error(
          '🚨 Error stack:',
          paymentError instanceof Error ? paymentError.stack : 'N/A',
        );
        console.error('🚨 Payment creation params:', {
          amount,
          poolAmount,
          token: selectedToken,
          campaignId: campaign.id,
          isAnonymous,
          status: 'confirming',
          transactionHash: daimoPaymentId,
          userEmail,
        });
        console.error('═══════════════════════════════════════════════');
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
