import { keccak256, toBytes, encodeFunctionData } from 'viem';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { DAIMO_PAY_MIN_AMOUNT } from '@/lib/constant/daimo';

/**
 * Generate a unique pledge ID for Daimo Pay transactions
 */
export function generatePledgeId(
  address: string,
  campaignId: number,
  amount: string,
  tipAmount: string,
): `0x${string}` {
  const pledgeString = `daimo-pledge-${address}-${campaignId}-${amount}-${tipAmount}`;
  return keccak256(toBytes(pledgeString));
}

/**
 * Convert amount to token units (6 decimals for both USDC and USDT)
 */
export function toTokenUnits(amount: number): bigint {
  return BigInt(Math.floor(amount * 1_000_000)); // 6 decimals for USDC/USDT
}

/**
 * @deprecated Use toTokenUnits instead
 */
export const toUSDCUnits = toTokenUnits;

/**
 * Encode pledge contract call data for Daimo Pay
 */
export function encodePledgeCallData(
  pledgeId: `0x${string}`,
  backerAddress: `0x${string}`,
  pledgeAmount: bigint,
  tipAmount: bigint,
): `0x${string}` {
  return encodeFunctionData({
    abi: KeepWhatsRaisedABI,
    functionName: 'pledgeWithoutAReward',
    args: [pledgeId, backerAddress, pledgeAmount, tipAmount],
  });
}

/**
 * Validate if pledge parameters are ready for contract call
 */
export function isPledgeDataValid(
  pledgeId: `0x${string}` | null,
  callData: `0x${string}` | null,
  address: string | undefined,
  totalAmount: number,
  minAmount: number = DAIMO_PAY_MIN_AMOUNT,
): boolean {
  return !!(
    pledgeId &&
    callData &&
    address &&
    totalAmount >= minAmount &&
    pledgeId !== '0x' &&
    callData !== '0x'
  );
}
