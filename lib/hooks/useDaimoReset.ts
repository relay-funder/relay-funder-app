import { useEffect, useRef } from 'react';
import { useDaimoPayUI } from '@daimo/pay';
import { getDaimoPayConfig } from '@/lib/web3/daimo/config';
import { DAIMO_PAY_DEBOUNCE_DELAY } from '@/lib/constant/daimo';
import { debugHook as debug } from '@/lib/debug';

interface UseDaimoResetParams {
  totalAmount: string;
  pledgeCallData: `0x${string}` | null;
  validatedTreasuryAddress: `0x${string}` | null;
  metadata: Record<string, string>;
  isValid: boolean;
}

/**
 * Hook for managing Daimo Pay reset payment with proper debouncing
 */
export function useDaimoReset({
  totalAmount,
  pledgeCallData,
  validatedTreasuryAddress,
  metadata,
  isValid,
}: UseDaimoResetParams) {
  const { resetPayment } = useDaimoPayUI();
  const hasCalledResetPaymentRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResetParamsRef = useRef<string>('');

  useEffect(() => {
    // Clear any pending debounced call
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    if (
      !isValid ||
      !resetPayment ||
      !validatedTreasuryAddress ||
      !pledgeCallData
    ) {
      return;
    }

    // Create a stable key for the current parameters
    const currentParamsKey = JSON.stringify({
      totalAmount,
      pledgeCallData,
      validatedTreasuryAddress,
      metadata,
    });

    // Check if parameters have actually changed before scheduling
    if (lastResetParamsRef.current === currentParamsKey) {
      debug && console.log('Daimo Pay: Skipping reset - parameters unchanged');
      return;
    }

    // Handle first render: skip reset, just record initial params
    if (!hasCalledResetPaymentRef.current) {
      debug &&
        console.log(
          'Daimo Pay: First render - recording initial params without reset',
          {
            totalAmount,
          },
        );
      hasCalledResetPaymentRef.current = true;
      lastResetParamsRef.current = currentParamsKey;
      return;
    }

    // Subsequent changes: use debounced reset
    debug &&
      console.log('Daimo Pay: Scheduling debounced resetPayment', {
        totalAmount,
        delay: DAIMO_PAY_DEBOUNCE_DELAY,
      });

    debounceTimeoutRef.current = setTimeout(() => {
      // Double-check parameters haven't changed during timeout
      if (lastResetParamsRef.current === currentParamsKey) {
        debug &&
          console.log(
            'Daimo Pay: Skipping resetPayment - parameters unchanged during timeout',
          );
        return;
      }

      debug &&
        console.log('Daimo Pay: Calling resetPayment', {
          totalAmount,
          metadata,
        });

      try {
        const daimoConfig = getDaimoPayConfig();
        resetPayment({
          toChain: daimoConfig.chainId,
          toToken: daimoConfig.tokenAddress,
          toAddress: validatedTreasuryAddress,
          toUnits: totalAmount,
          toCallData: pledgeCallData,
          metadata,
        });

        lastResetParamsRef.current = currentParamsKey;
        debug && console.log('Daimo Pay: resetPayment completed');
      } catch (error) {
        console.error('Daimo Pay: resetPayment error:', error);
      }
    }, DAIMO_PAY_DEBOUNCE_DELAY);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    isValid,
    resetPayment,
    validatedTreasuryAddress,
    pledgeCallData,
    totalAmount,
    metadata,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
}
