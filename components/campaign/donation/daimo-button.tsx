'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { DaimoPayButton, useDaimoPayUI } from '@daimo/pay';
import { optimismUSDC } from '@daimo/pay-common';
import { getAddress, encodeFunctionData } from 'viem';
import { DbCampaign } from '@/types/campaign';
import { DAIMO_PAY_APP_ID } from '@/lib/constant';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useDaimoDonationCallback } from '@/hooks/use-daimo-donation';
import { useAccount } from 'wagmi';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { ethers } from '@/lib/web3';
import { debugHook as debug } from '@/lib/debug';

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
  const { resetPayment } = useDaimoPayUI();

  // Calculate amounts separately for smart contract (memoized to prevent recalculation on every render)
  const baseAmount = useMemo(() => parseFloat(amount || '0'), [amount]);
  const tipAmountNum = useMemo(() => parseFloat(tipAmount || '0'), [tipAmount]);
  const totalAmount = useMemo(() => {
    const total = (baseAmount + tipAmountNum).toFixed(2);
    debug &&
      console.log('Daimo Pay amounts:', {
        amount,
        tipAmount,
        baseAmount,
        tipAmountNum,
        totalAmount: total,
        expectedTipPercentage:
          baseAmount > 0
            ? ((tipAmountNum / baseAmount) * 100).toFixed(2) + '%'
            : 'N/A',
      });
    return total;
  }, [baseAmount, tipAmountNum, amount, tipAmount]);

  // Generate pledge ID for Daimo Pay transaction (memoized to prevent re-creation on every render)
  const pledgeId = useMemo(() => {
    if (!address) return '0x'; // Return dummy value if address not available
    return ethers.keccak256(
      ethers.toUtf8Bytes(
        `daimo-pledge-${address}-${campaign.id}-${amount}-${tipAmount}`,
      ),
    );
  }, [address, campaign.id, amount, tipAmount]);

  // Convert amounts to proper units (USDC has 6 decimals)
  const pledgeAmountInUSDC = useMemo(
    () => ethers.parseUnits(baseAmount.toString(), 6), // 6 decimals for USDC
    [baseAmount],
  );
  const tipAmountInUSDC = useMemo(
    () => ethers.parseUnits(tipAmountNum.toString(), 6),
    [tipAmountNum],
  );

  // Encode the pledgeWithoutAReward contract call (memoized)
  const pledgeCallData = useMemo(() => {
    if (!address || pledgeId === '0x') return '0x'; // Return dummy value if address not available
    return encodeFunctionData({
      abi: KeepWhatsRaisedABI,
      functionName: 'pledgeWithoutAReward',
      args: [
        pledgeId,
        address as `0x${string}`, // backer address
        pledgeAmountInUSDC, // pledge amount in USDC units
        tipAmountInUSDC, // tip amount in USDC units
      ],
    });
  }, [pledgeId, address, pledgeAmountInUSDC, tipAmountInUSDC]);

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

  // Validate and memoize address formats (memoized to prevent changing references on every render)
  const { validatedTreasuryAddress, addressValidationError } = useMemo(() => {
    let validatedTreasuryAddr: `0x${string}` | null = null;
    let hasError = false;

    if (address && campaign.treasuryAddress) {
      try {
        getAddress(address); // Validate user address format
        validatedTreasuryAddr = getAddress(campaign.treasuryAddress);
      } catch (error) {
        console.error('Daimo Pay: Invalid address format:', error);
        hasError = true;
      }
    }

    return {
      validatedTreasuryAddress: validatedTreasuryAddr,
      addressValidationError: hasError,
    };
  }, [address, campaign.treasuryAddress]);

  // Track whether we've called resetPayment at least once
  const hasCalledResetPaymentRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update payment parameters using resetPayment per Daimo Pay documentation
  // First update: immediate (captures initial tip)
  // Subsequent updates: debounced (smooth slider experience)
  useEffect(() => {
    // Clear any pending debounced call
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Validate we have all required parameters
    if (
      !resetPayment ||
      !validatedTreasuryAddress ||
      parseFloat(totalAmount) < 0.1
    ) {
      return;
    }

    if (pledgeCallData === '0x' || pledgeId === '0x') {
      return;
    }

    // Function to call resetPayment with current parameters
    const executeResetPayment = () => {
      const isFirstCall = !hasCalledResetPaymentRef.current;

      debug &&
        console.log('Daimo Pay: Calling resetPayment', {
          totalAmount,
          tipAmount,
          baseAmount: amount,
          isFirstCall,
          breakdown: {
            base: parseFloat(amount),
            tip: parseFloat(tipAmount),
            calculated: (parseFloat(amount) + parseFloat(tipAmount)).toFixed(2),
            toUnits: totalAmount,
          },
        });

      try {
        resetPayment({
          toChain: optimismUSDC.chainId,
          toToken: getAddress(optimismUSDC.token),
          toAddress: validatedTreasuryAddress,
          toUnits: totalAmount,
          toCallData: pledgeCallData,
          metadata: {
            campaignId: campaign.id.toString(),
            pledgeId: pledgeId,
            email,
            anonymous: anonymous.toString(),
            tipAmount,
            baseAmount: amount,
            token: 'USDC',
            chain: 'Optimism',
          },
        });

        hasCalledResetPaymentRef.current = true;
        debug && console.log('Daimo Pay: resetPayment completed');
      } catch (error) {
        console.error('Daimo Pay: resetPayment error:', error);
      }
    };

    // First call: 500ms delay to ensure tip calculation propagates through component tree
    // Subsequent calls: 300ms debounce for smooth slider experience
    if (!hasCalledResetPaymentRef.current) {
      // Wait 500ms for tip component to calculate, propagate state, and update tipAmount
      // This handles the initial render where React needs time to run all useEffects
      debug &&
        console.log(
          'Daimo Pay: First call - scheduling resetPayment in 500ms',
          {
            currentTipAmount: tipAmount,
            currentTotalAmount: totalAmount,
          },
        );
      debounceTimeoutRef.current = setTimeout(executeResetPayment, 500);
    } else {
      debounceTimeoutRef.current = setTimeout(executeResetPayment, 300);
    }

    // Cleanup: clear timeout on unmount or when dependencies change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    totalAmount,
    pledgeId,
    pledgeCallData,
    validatedTreasuryAddress,
    campaign.id,
    email,
    anonymous,
    tipAmount,
    amount,
  ]);

  const handlePaymentStarted = async (event: DaimoPayEvent) => {
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

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  const handlePaymentCompleted = async (event: DaimoPayEvent) => {
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

  const handlePaymentBounced = async (event: DaimoPayEvent) => {
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

  // Conditional returns - ALL hooks must be called before these
  // Handle address validation errors
  if (addressValidationError) {
    return (
      <Button disabled className="w-full" size="lg">
        Invalid Address Format
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

  // Ensure we're accepting USDC payments only
  if (configuredToken.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
    console.error('Daimo Pay not configured for USDC!', {
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
    console.error('Daimo Pay not configured for Optimism!', {
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

  // Only render Daimo Pay button when amount meets minimum requirement
  if (parseFloat(totalAmount) < 0.1) {
    return (
      <Button disabled className="w-full" size="lg">
        Enter donation amount to continue
      </Button>
    );
  }

  // Only render the button when we have valid amounts
  if (
    parseFloat(totalAmount) < 0.1 ||
    pledgeCallData === '0x' ||
    pledgeId === '0x'
  ) {
    return (
      <Button disabled className="w-full">
        Enter donation amount to continue
      </Button>
    );
  }

  // Type guard: ensure we have a validated treasury address at this point
  if (!validatedTreasuryAddress) {
    return (
      <Button disabled className="w-full">
        Campaign treasury address not available
      </Button>
    );
  }

  debug &&
    console.log('Daimo Pay: Rendering button with final values', {
      totalAmount,
      toUnits: totalAmount,
      baseAmount: amount,
      tipAmount,
      calculatedTotal: (parseFloat(amount) + parseFloat(tipAmount)).toFixed(2),
      treasuryAddress: validatedTreasuryAddress,
      pledgeId: pledgeId.substring(0, 10) + '...',
    });

  return (
    <div className="w-full">
      <DaimoPayButton
        appId={DAIMO_PAY_APP_ID}
        intent="Donate now"
        toChain={optimismUSDC.chainId}
        toToken={getAddress(optimismUSDC.token)}
        toAddress={validatedTreasuryAddress}
        toUnits={totalAmount}
        toCallData={pledgeCallData}
        metadata={{
          campaignId: campaign.id.toString(),
          pledgeId: pledgeId,
          email,
          anonymous: anonymous.toString(),
          tipAmount,
          baseAmount: amount,
          token: 'USDC',
          chain: 'Optimism',
        }}
        onPaymentStarted={handlePaymentStarted}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentBounced={handlePaymentBounced}
      />
    </div>
  );
}
