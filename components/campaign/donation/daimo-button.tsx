'use client';

import React, { useCallback, useMemo } from 'react';
import { DaimoPayButton } from '@daimo/pay';
import { DbCampaign } from '@/types/campaign';
import { DAIMO_PAY_APP_ID } from '@/lib/constant';
import { NEXT_PUBLIC_PLATFORM_ADMIN } from '@/lib/constant/server';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useDaimoDonationCallback } from '@/hooks/use-daimo-donation';
import { useAccount } from 'wagmi';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';
import { useDaimoPayment } from '@/lib/hooks/useDaimoPayment';
import { useDaimoReset } from '@/lib/hooks/useDaimoReset';
import { debugComponentData as debug } from '@/lib/debug';
import { EmailSchema } from '@/lib/api/types/common';

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
  } = useDaimoDonationCallback();

  const handlePaymentStarted = useCallback(
    async (event: DaimoPayEvent) => {
      debug && console.log('Daimo Pay: Payment started', event);

      try {
        // Validate email using Zod
        if (!email.trim()) {
          toast({
            title: 'Email required',
            description: 'Please enter your email address to continue.',
            variant: 'destructive',
          });
          throw new Error('Email required');
        }

        const emailValidation = EmailSchema.safeParse(email);
        if (!emailValidation.success) {
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
    const isEmailValid = email && email.trim() && EmailSchema.safeParse(email).success;
    const buttonText = !isEmailValid
      ? "Enter valid email to continue"
      : "Enter donation amount to continue";

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

  debug &&
    console.log('Daimo Pay: Rendering button with final values', {
      totalAmount: paymentData.totalAmount,
      baseAmount: amount,
      tipAmount,
      adminWalletAddress: NEXT_PUBLIC_PLATFORM_ADMIN,
      treasuryAddress: paymentData.validatedTreasuryAddress,
      refundAddress: paymentData.validatedRefundAddress,
      intent: dynamicIntent,
      appId: DAIMO_PAY_APP_ID,
      isValid: paymentData.isValid,
      config: paymentData.config,
      note: 'Gateway integration: Daimo sends to admin wallet, webhook executes pledge to treasury',
    });

  console.log('🚀 Daimo Pay: Button rendering with appId:', DAIMO_PAY_APP_ID);
  console.log(
    '🚀 Daimo Pay: Registering callbacks - onPaymentStarted function:',
    typeof handlePaymentStarted,
  );

  return (
    <div className="mb-6 w-full">
      <DaimoPayButton.Custom
        appId={DAIMO_PAY_APP_ID}
        intent={dynamicIntent}
        toChain={paymentData.config.chainId}
        toToken={paymentData.config.tokenAddress}
        toAddress={NEXT_PUBLIC_PLATFORM_ADMIN}
        toUnits={paymentData.totalAmount}
        refundAddress={paymentData.validatedRefundAddress}
        metadata={paymentData.metadata}
        onPaymentStarted={(event) => {
          console.log(
            '🚀 Daimo Pay: DaimoPayButton onPaymentStarted triggered with event:',
            event,
          );
          return handlePaymentStarted(event);
        }}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentBounced={handlePaymentBounced}
      >
        {({ show }) => (
          <Button variant="default" className="w-full" size="lg" onClick={show}>
            Contribute to{' '}
            <b>
              {campaign.title.substring(0, 64)}
              {campaign.title.length > 64 && '...'}
            </b>{' '}
            in {campaign.location}
          </Button>
        )}
      </DaimoPayButton.Custom>
    </div>
  );
}
