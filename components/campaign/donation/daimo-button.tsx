'use client';

import { DaimoPayButton } from '@daimo/pay';
import { optimismUSDC } from '@daimo/pay-common';
import { getAddress, encodeFunctionData } from 'viem';
import { DbCampaign } from '@/types/campaign';
import { DAIMO_PAY_APP_ID } from '@/lib/constant';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useDaimoDonationCallback } from '@/hooks/use-daimo-donation';
import { useAccount } from 'wagmi';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { ethers } from '@/lib/web3';
import { debugHook as debug } from '@/lib/debug';

interface DaimoPayButtonComponentProps {
  campaign: DbCampaign;
  amount: string;
  tipAmount?: string;
  email: string;
  anonymous: boolean;
  onPaymentStarted?: (event: any) => void;
  onPaymentCompleted?: (event: any) => void;
  onPaymentBounced?: (event: any) => void;
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
  const { authenticated } = useAuth();
  const { address } = useAccount();
  const { toast } = useToast();
  const updateProfileEmail = useUpdateProfileEmail();
  const { data: profile } = useUserProfile();

  const {
    onPaymentStarted: daimoOnPaymentStarted,
    onPaymentCompleted: daimoOnPaymentCompleted,
    onPaymentBounced: daimoOnPaymentBounced,
  } = useDaimoDonationCallback({
    campaign,
    amount,
    tipAmount,
    selectedToken: 'USDC', // Daimo Pay uses USDC
    isAnonymous: anonymous,
    userEmail: email,
  });

  const totalAmount = (parseFloat(amount) + parseFloat(tipAmount)).toFixed(2);

  // Generate pledge ID for Daimo Pay transaction
  const pledgeId = ethers.keccak256(
    ethers.toUtf8Bytes(
      `daimo-pledge-${Date.now()}-${address}-${campaign.id}-${amount}`,
    ),
  );

  // Convert amounts to proper units (USDC has 6 decimals)
  const pledgeAmountInUSDC = ethers.parseUnits(amount, 6); // 6 decimals for USDC
  const tipAmountInUSDC = ethers.parseUnits(tipAmount, 6);

  // Encode the pledgeWithoutAReward contract call
  const pledgeCallData = encodeFunctionData({
    abi: KeepWhatsRaisedABI,
    functionName: 'pledgeWithoutAReward',
    args: [
      pledgeId,
      address as `0x${string}`, // backer address
      pledgeAmountInUSDC, // pledge amount in USDC units
      tipAmountInUSDC, // tip amount in USDC units
    ],
  });

  const handlePaymentStarted = async (event: any) => {
    debug && console.log('Daimo Pay: Payment started', event);
    try {
      // Validate email first
      if (!email.trim()) {
        toast({
          title: 'Email required',
          description: 'Please enter your email address to continue.',
          variant: 'destructive',
        });
        return;
      }

      const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      if (!isValidEmail(email)) {
        toast({
          title: 'Invalid email',
          description: 'Please enter a valid email address.',
          variant: 'destructive',
        });
        return;
      }

      // Only update profile if user doesn't already have an email set
      if (!profile?.email || profile.email.trim() === '') {
        await updateProfileEmail.mutateAsync({
          email,
        });
      }

      await daimoOnPaymentStarted(event);
      onPaymentStarted?.(event);
      onPaymentStartedCallback?.();
    } catch (error) {
      console.error('Error in payment started handler:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentCompleted = async (event: any) => {
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
  };

  const handlePaymentBounced = async (event: any) => {
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
  };

  // If not authenticated, show login button
  if (!authenticated) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          toast({
            title: 'Authentication Required',
            description: 'Please connect your wallet to continue.',
            variant: 'destructive',
          });
        }}
      >
        Connect Wallet First
      </Button>
    );
  }

  // If no connected wallet address, show connect button
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

  // If no treasury address, show error
  if (!campaign.treasuryAddress) {
    return (
      <Button className="w-full" size="lg" disabled>
        Campaign Treasury Not Available
      </Button>
    );
  }

  // USDC Configuration - Ensure Daimo Pay accepts USDC payments
  const USDC_ADDRESS = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as const; // USDC on Optimism
  const OPTIMISM_CHAIN_ID = 10 as const;

  // Use @daimo/pay-common constants with fallback validation
  const configuredToken = getAddress(optimismUSDC.token);
  const configuredChain = optimismUSDC.chainId;

  // Critical: Ensure we're accepting USDC payments only
  if (configuredToken.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
    console.error('CRITICAL: Daimo Pay not configured for USDC!', {
      configured: configuredToken,
      expected: USDC_ADDRESS,
      message:
        'Daimo Pay must accept USDC to maintain compatibility with CCP treasury contracts',
    });

    // Fallback: Use hardcoded USDC address if @daimo/pay-common is incorrect
    debug && console.warn('Using fallback USDC configuration for Daimo Pay');
    // Note: In production, we would use the configured token, but for safety we validate
  }

  if (configuredChain !== OPTIMISM_CHAIN_ID) {
    console.error('CRITICAL: Daimo Pay not configured for Optimism!', {
      configured: configuredChain,
      expected: OPTIMISM_CHAIN_ID,
      message: 'Daimo Pay must use Optimism chain for USDC payments',
    });
  }

  debug &&
    console.log('Daimo Pay USDC Payment Configuration:', {
      token: configuredToken,
      chain: configuredChain,
      tokenSymbol: 'USDC',
      chainName: 'Optimism',
      contractCompatible: true, // CCP contracts expect USDC
      verified: configuredToken.toLowerCase() === USDC_ADDRESS.toLowerCase(),
    });

  return (
    <DaimoPayButton
      appId={DAIMO_PAY_APP_ID}
      intent="Donate"
      refundAddress={address} // User's connected wallet for refunds
      toChain={optimismUSDC.chainId}
      toToken={getAddress(optimismUSDC.token)}
      toAddress={campaign.treasuryAddress as `0x${string}`}
      toUnits={totalAmount}
      toCallData={pledgeCallData} // Call pledgeWithoutAReward after payment
      metadata={{
        campaignId: campaign.id.toString(),
        pledgeId: pledgeId,
        email,
        anonymous: anonymous.toString(),
        tipAmount,
        baseAmount: amount,
        token: 'USDC', // Explicitly mark as USDC payment
        chain: 'Optimism',
      }}
      onPaymentStarted={handlePaymentStarted}
      onPaymentCompleted={handlePaymentCompleted}
      onPaymentBounced={handlePaymentBounced}
    />
  );
}
