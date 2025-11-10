'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { DaimoPayButton } from '@daimo/pay';
import { DbCampaign } from '@/types/campaign';
import { DAIMO_PAY_APP_ID, ADMIN_ADDRESS } from '@/lib/constant';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useDaimoDonationCallback } from '@/hooks/use-daimo-donation';
import { useAccount } from 'wagmi';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';
import { useDaimoPayment } from '@/lib/hooks/useDaimoPayment';
import { useDaimoReset } from '@/lib/hooks/useDaimoReset';
import { EmailSchema } from '@/lib/api/types/common';
import { logFactory } from '@/lib/debug/log';

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

  const logVerbose = useMemo(
    () => logFactory('verbose', '🚀 DaimoPayButton', address),
    [address],
  );

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
  } = useDaimoDonationCallback();

  const handlePaymentStarted = useCallback(
    async (event: DaimoPayEvent) => {
      logVerbose('Payment started', { ...event, prefixId: event.paymentId });

      try {
        // Validate email using Zod
        if (!paymentData.isEmailValid) {
          toast({
            title: 'Invalid email',
            description: 'Please enter a valid email address.',
            variant: 'destructive',
          });
          throw new Error('Invalid email format');
        }

        // Only update profile if user doesn't already have an email set
        if (!profile?.email || profile.email.trim() === '') {
          try {
            await updateProfileEmail.mutateAsync({ email });
          } catch (emailError) {
            console.error('Failed to update profile email:', emailError);
            // Don't throw here, continue with payment creation
          }
        }

        await daimoOnPaymentStarted(event);
        onPaymentStarted?.(event);
        onPaymentStartedCallback?.();
      } catch (error) {
        console.error('Daimo Pay: Payment initialization failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: 'Payment Initialization Failed',
          description: `Failed to initialize payment: ${errorMessage}. Please try again.`,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [
      email,
      toast,
      paymentData,
      profile?.email,
      updateProfileEmail,
      daimoOnPaymentStarted,
      onPaymentStarted,
      onPaymentStartedCallback,
      logVerbose,
    ],
  );

  const handlePaymentCompleted = useCallback(
    async (event: DaimoPayEvent) => {
      logVerbose('Payment completed', { ...event, prefixId: event.paymentId });
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
      logVerbose,
    ],
  );

  const handlePaymentBounced = useCallback(
    async (event: DaimoPayEvent) => {
      logVerbose('Payment bounced', { ...event, prefixId: event.paymentId });
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
    [
      daimoOnPaymentBounced,
      toast,
      onPaymentBounced,
      onPaymentBouncedCallback,
      logVerbose,
    ],
  );

  const handleContribute = useCallback(
    (callback: () => void) => {
      logVerbose('Contribute button clicked');
      callback();
    },
    [logVerbose],
  );

  useEffect(() => {
    logVerbose('Rendering button with final values', {
      appId: DAIMO_PAY_APP_ID,
      adminWalletAddress: ADMIN_ADDRESS,
      treasuryAddress: paymentData.validatedTreasuryAddress,
      campaignTreasuryAddress: campaign.treasuryAddress,
      refundAddress: paymentData.validatedRefundAddress,
      totalAmount: paymentData.totalAmount,
      baseAmount: amount,
      tipAmount,
      intent: dynamicIntent,
      isValid: paymentData.isValid,
      config: paymentData.config,
      note: 'Gateway integration: Daimo sends to admin wallet, webhook executes pledge to treasury',
    });
    logVerbose(
      'Registering callbacks - onPaymentStarted function:',
      typeof handlePaymentStarted,
    );
  }, [
    paymentData.totalAmount,
    paymentData.validatedTreasuryAddress,
    paymentData.validatedRefundAddress,
    paymentData.isValid,
    paymentData.config,
    amount,
    tipAmount,
    dynamicIntent,
    handlePaymentStarted,
    logVerbose,
    campaign.treasuryAddress,
  ]);

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
    const buttonText = !paymentData.isEmailValid
      ? 'Enter valid email to continue'
      : 'Enter donation amount to continue';

    return (
      <Button disabled className="w-full" size="lg">
        {buttonText}
      </Button>
    );
  }

  // Runtime validation for DAIMO_PAY_APP_ID
  if (!DAIMO_PAY_APP_ID || DAIMO_PAY_APP_ID.trim() === '') {
    console.error('🚨 Daimo Pay: App ID is missing - Daimo Pay will not work');
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

  return (
    <div className="mb-6 w-full">
      <DaimoPayButton.Custom
        appId={DAIMO_PAY_APP_ID}
        intent={dynamicIntent}
        toChain={paymentData.config.chainId}
        toToken={paymentData.config.tokenAddress}
        toAddress={ADMIN_ADDRESS as `0x${string}`}
        toUnits={paymentData.totalAmount}
        refundAddress={paymentData.validatedRefundAddress}
        metadata={paymentData.metadata}
        onPaymentStarted={handlePaymentStarted}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentBounced={handlePaymentBounced}
      >
        {({ show }) => (
          <Button variant="default" className="w-full" size="lg" onClick={show}>
            Support Now
          </Button>
        )}
      </DaimoPayButton.Custom>
    </div>
  );
}
