import { useMemo } from 'react';
import { getAddress } from 'viem';
import { useAccount } from 'wagmi';
import { DbCampaign } from '@/types/campaign';
import {
  generatePledgeId,
  toTokenUnits,
  encodePledgeCallData,
  isPledgeDataValid,
} from '@/lib/web3/daimo/pledge';
import { getDaimoPayConfig } from '@/lib/web3/daimo/config';
import { DAIMO_PAY_MIN_AMOUNT } from '@/lib/constant/daimo';

interface UseDaimoPaymentParams {
  campaign: DbCampaign;
  amount: string;
  tipAmount: string;
  email: string;
  anonymous: boolean;
}

interface DaimoPaymentData {
  pledgeId: `0x${string}` | null;
  pledgeCallData: `0x${string}` | null;
  totalAmount: string;
  validatedTreasuryAddress: `0x${string}` | null;
  validatedRefundAddress: `0x${string}` | null;
  metadata: Record<string, string>;
  isValid: boolean;
  config: ReturnType<typeof getDaimoPayConfig>;
}

/**
 * Hook for managing Daimo Pay payment parameters and validation
 */
export function useDaimoPayment({
  campaign,
  amount,
  tipAmount,
  email,
  anonymous,
}: UseDaimoPaymentParams): DaimoPaymentData {
  const { address } = useAccount();
  const config = useMemo(() => getDaimoPayConfig(), []);

  // Calculate amounts
  const baseAmount = useMemo(() => parseFloat(amount || '0'), [amount]);
  const tipAmountNum = useMemo(() => parseFloat(tipAmount || '0'), [tipAmount]);
  const totalAmount = useMemo(() => {
    return (baseAmount + tipAmountNum).toFixed(2);
  }, [baseAmount, tipAmountNum]);

  // Generate pledge ID
  const pledgeId = useMemo(() => {
    if (!address) return null;
    return generatePledgeId(address, campaign.id, amount, tipAmount);
  }, [address, campaign.id, amount, tipAmount]);

  // Validate and format treasury address
  const validatedTreasuryAddress = useMemo(() => {
    if (!address || !campaign.treasuryAddress) return null;

    try {
      getAddress(address); // Validate user address format
      return getAddress(campaign.treasuryAddress);
    } catch (error) {
      console.error('Daimo Pay: Invalid address format:', error);
      return null;
    }
  }, [address, campaign.treasuryAddress]);

  // Validate refund address with fallback to treasury address
  // Ensures non-null, network-valid address for Daimo Pay refunds
  const validatedRefundAddress = useMemo(() => {
    // First priority: user's connected wallet address
    if (address) {
      try {
        return getAddress(address);
      } catch (error) {
        console.warn(
          'Daimo Pay: Invalid user address format, using treasury fallback:',
          error,
        );
      }
    }

    // Fallback: campaign treasury address (already validated for network)
    if (validatedTreasuryAddress) {
      return validatedTreasuryAddress;
    }

    return null;
  }, [address, validatedTreasuryAddress]);

  // Generate contract call data
  const pledgeCallData = useMemo(() => {
    if (!address || !pledgeId || !validatedTreasuryAddress) return null;

    try {
      const pledgeAmountInTokenUnits = toTokenUnits(baseAmount);
      const tipAmountInTokenUnits = toTokenUnits(tipAmountNum);

      return encodePledgeCallData(
        pledgeId,
        address as `0x${string}`,
        pledgeAmountInTokenUnits,
        tipAmountInTokenUnits,
      );
    } catch (error) {
      console.error('Daimo Pay: Error encoding call data:', error);
      return null;
    }
  }, [pledgeId, address, validatedTreasuryAddress, baseAmount, tipAmountNum]);

  // Memoized metadata to prevent re-renders
  const metadata = useMemo(
    () => ({
      campaignId: campaign.id.toString(),
      pledgeId: pledgeId || '',
      email,
      anonymous: anonymous.toString(),
      tipAmount,
      baseAmount: amount,
      token: config.tokenSymbol,
      chain: config.chainName,
    }),
    [campaign.id, pledgeId, email, anonymous, tipAmount, amount, config],
  );

  // Validate all parameters
  const isValid = useMemo(() => {
    return (
      isPledgeDataValid(
        pledgeId,
        pledgeCallData,
        address,
        parseFloat(totalAmount),
        DAIMO_PAY_MIN_AMOUNT,
      ) &&
      config.isValid &&
      !!validatedTreasuryAddress
    );
  }, [
    pledgeId,
    pledgeCallData,
    address,
    totalAmount,
    config.isValid,
    validatedTreasuryAddress,
  ]);

  return {
    pledgeId,
    pledgeCallData,
    totalAmount,
    validatedTreasuryAddress,
    validatedRefundAddress,
    metadata,
    isValid,
    config,
  };
}
