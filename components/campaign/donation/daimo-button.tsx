'use client';

import React, { useCallback, useMemo } from 'react';
import { DaimoPayButton } from '@daimo/pay';
import { DbCampaign } from '@/types/campaign';
import { DAIMO_PAY_APP_ID } from '@/lib/constant';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useDaimoDonationCallback } from '@/hooks/use-daimo-donation';
import { useAccount } from 'wagmi';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';
import { useDaimoPayment } from '@/lib/hooks/useDaimoPayment';
import { useDaimoReset } from '@/lib/hooks/useDaimoReset';
import { debugComponentData as debug } from '@/lib/debug';

interface DaimoPayEvent {
  paymentId?: string;
  status?: string;
  amount?: string;
  [key: string]: unknown;
}

interface DaimoPayButtonComponentProps {
  campaign: DbCampaign;
  amount: string;
  tipAmount?: string;
  email: string;
  anonymous: boolean;
  onPaymentStarted?: (event: DaimoPayEvent) => void;
  onPaymentCompleted?: (event: DaimoPayEvent) => void;
  onPaymentBounced?: (event: DaimoPayEvent) => void;
  onPaymentStartedCallback?: () => void;
  onPaymentCompletedCallback?: () => void;
  onPaymentBouncedCallback?: () => void;
}

export function DaimoPayButtonComponent({
  campaign,
  amount,
  tipAmount = '0',
  email,
  anonymous,
  onPaymentStarted,
  onPaymentCompleted,
  onPaymentBounced,
  onPaymentStartedCallback,
  onPaymentCompletedCallback,
  onPaymentBouncedCallback,
}: DaimoPayButtonComponentProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const updateProfileEmail = useUpdateProfileEmail();
  const { data: profile } = useUserProfile();

  // Create dynamic intent with campaign name and location
  const dynamicIntent = useMemo(() => {
    const baseName = campaign.title?.trim() ? campaign.title : 'Campaign';
    const location = campaign.location?.trim()
      ? ` in ${campaign.location}`
      : '';
    return `Contribute to ${baseName}${location}`;
  }, [campaign.title, campaign.location]);

  // Use custom hooks for payment management
  const paymentData = useDaimoPayment({
    campaign,
    amount,
    tipAmount,
    email,
    anonymous,
  });

  // Use custom hook for reset payment logic
  useDaimoReset({
    totalAmount: paymentData.totalAmount,
    pledgeCallData: paymentData.pledgeCallData,
    validatedTreasuryAddress: paymentData.validatedTreasuryAddress,
    metadata: paymentData.metadata,
    isValid: paymentData.isValid,
  });

  const {
    onPaymentStarted: daimoOnPaymentStarted,
    onPaymentCompleted: daimoOnPaymentCompleted,
    onPaymentBounced: daimoOnPaymentBounced,
  } = useDaimoDonationCallback({
    campaign,
    amount,
    tipAmount,
    selectedToken: paymentData.config.tokenSymbol,
    isAnonymous: anonymous,
    userEmail: email,
  });

  const handlePaymentStarted = useCallback(
    async (event: DaimoPayEvent) => {
      console.log(
        '🚀 Daimo Pay: handlePaymentStarted called in button component',
      );
      debug && console.log('Daimo Pay: Payment started', event);
      debug &&
        console.log(
          'Daimo Pay: Event structure:',
          JSON.stringify(event, null, 2),
        );
      try {
        if (!email.trim()) {
          toast({
            title: 'Email required',
            description: 'Please enter your email address to continue.',
            variant: 'destructive',
          });
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast({
            title: 'Invalid email',
            description: 'Please enter a valid email address.',
            variant: 'destructive',
          });
          return;
        }

        if (!profile?.email || profile.email.trim() === '') {
          console.log(
            '🚀 Daimo Pay: Updating profile email before payment creation',
          );
          try {
            await updateProfileEmail.mutateAsync({ email });
            console.log('✅ Daimo Pay: Profile email updated successfully');
          } catch (emailError) {
            console.error(
              '🚨 Daimo Pay: Failed to update profile email:',
              emailError,
            );
            // Don't throw here, continue with payment creation
          }
        }

        console.log('🚀 Daimo Pay: Calling daimoOnPaymentStarted');
        await daimoOnPaymentStarted(event);
        onPaymentStarted?.(event);
        onPaymentStartedCallback?.();
      } catch (error) {
        console.error('Error in payment started handler:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: 'Payment Initialization Failed',
          description: `Failed to initialize payment: ${errorMessage}. Please try again.`,
          variant: 'destructive',
        });
        // Re-throw to potentially abort Daimo Pay flow if possible
        throw error;
      }
    },
    [
      email,
      toast,
      profile?.email,
      updateProfileEmail,
      daimoOnPaymentStarted,
      onPaymentStarted,
      onPaymentStartedCallback,
    ],
  );

  const handlePaymentCompleted = useCallback(
    async (event: DaimoPayEvent) => {
      debug && console.log('Daimo Pay: Payment completed', event);
      try {
        await daimoOnPaymentCompleted(event);
        toast({
          title: 'Payment Successful',
          description: 'Your donation has been processed successfully.',
        });
        onPaymentCompleted?.(event);
        onPaymentCompletedCallback?.();
      } catch (error) {
        console.error('Error in payment completed handler:', error);
      }
    },
    [
      daimoOnPaymentCompleted,
      toast,
      onPaymentCompleted,
      onPaymentCompletedCallback,
    ],
  );

  const handlePaymentBounced = useCallback(
    async (event: DaimoPayEvent) => {
      debug && console.log('Daimo Pay: Payment bounced', event);
      try {
        await daimoOnPaymentBounced(event);
        toast({
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please try again.',
          variant: 'destructive',
        });
        onPaymentBounced?.(event);
        onPaymentBouncedCallback?.();
      } catch (error) {
        console.error('Error in payment bounced handler:', error);
      }
    },
    [daimoOnPaymentBounced, toast, onPaymentBounced, onPaymentBouncedCallback],
  );

  // Early returns for error states
  if (!address) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          toast({
            title: 'Wallet Connection Required',
            description: 'Please connect your wallet to make a donation.',
            variant: 'destructive',
          });
        }}
      >
        Connect Wallet to Donate
      </Button>
    );
  }

  if (!campaign.treasuryAddress) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Campaign treasury not available. Please contact support.
        </p>
      </div>
    );
  }

  if (!paymentData.config.isValid) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Payment configuration error. Please try again later.
        </p>
      </div>
    );
  }

  if (!paymentData.isValid) {
    return (
      <Button disabled className="w-full" size="lg">
        Enter donation amount to continue
      </Button>
    );
  }

  // Runtime validation for DAIMO_PAY_APP_ID
  if (!DAIMO_PAY_APP_ID || DAIMO_PAY_APP_ID.trim() === '') {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Daimo Pay configuration error: App ID is missing.
        </p>
        <p className="mt-1 text-xs text-red-600">
          Please contact support if this issue persists.
        </p>
      </div>
    );
  }

  // Ensure refund address is available (should be non-null due to fallback logic)
  if (!paymentData.validatedRefundAddress) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Daimo Pay configuration error: Refund address unavailable.
        </p>
        <p className="mt-1 text-xs text-red-600">
          Please ensure your wallet is connected or contact support.
        </p>
      </div>
    );
  }

  debug &&
    console.log('Daimo Pay: Rendering button with final values', {
      totalAmount: paymentData.totalAmount,
      baseAmount: amount,
      tipAmount,
      treasuryAddress: paymentData.validatedTreasuryAddress,
      refundAddress: paymentData.validatedRefundAddress,
      intent: dynamicIntent,
    });

  return (
    <div className="w-full">
      <DaimoPayButton
        appId={DAIMO_PAY_APP_ID}
        intent={dynamicIntent}
        toChain={paymentData.config.chainId}
        toToken={paymentData.config.tokenAddress}
        toAddress={paymentData.validatedTreasuryAddress!}
        toUnits={paymentData.totalAmount}
        toCallData={paymentData.pledgeCallData!}
        refundAddress={paymentData.validatedRefundAddress}
        metadata={paymentData.metadata}
        onPaymentStarted={handlePaymentStarted}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentBounced={handlePaymentBounced}
      />
    </div>
  );
}
