import { ethers } from '@/lib/web3';
import { debugApi as debug } from '@/lib/debug';

/**
 * Daimo gateway fee configuration
 * 2% total: 1% protocol fee + 1% Daimo fee
 */
const DAIMO_FEE_BASIS_POINTS = 200n; // 2% in basis points
const PERCENT_DIVIDER = 10000n; // CCP contract uses 10000 as 100%

/**
 * Calculate Daimo gateway fee as a fixed amount in token units.
 *
 * The CCP KeepWhatsRaised contract expects gateway fees as fixed amounts
 * in token units (not percentages). This function calculates the fee and
 * returns it in the smallest token unit (e.g., for USDT with 6 decimals,
 * returns the fee in units of 10^-6).
 *
 * @param pledgeAmount - The pledge amount in human-readable format (e.g., "100" for $100)
 * @param decimals - Token decimals (default 6 for USDT/USDC)
 * @returns Fee amount in token units (bigint)
 *
 * @example
 * // For a $100 pledge with USDT (6 decimals):
 * const fee = calculateDaimoGatewayFee("100", 6);
 * // Returns: 2000000n (2 USDT in smallest units)
 *
 * @example
 * // For a $50 pledge:
 * const fee = calculateDaimoGatewayFee("50", 6);
 * // Returns: 1000000n (1 USDT in smallest units)
 *
 * @remarks
 * Fee Calculation:
 * - CCP contracts use PERCENT_DIVIDER = 10000 (100 basis points = 1%)
 * - 2% fee = 200 basis points
 * - Formula: fee = (pledgeAmount * 200) / 10000
 * - This fee is applied AFTER the pledge is converted to token units
 *
 * Important Notes:
 * - Gateway fee is calculated on pledge amount ONLY (not including tips)
 * - The fee is stored per pledgeId in the contract
 * - During _calculateNetAvailable, this fee is deducted from available funds
 * - Tips are NOT included in gateway fee calculation
 */
export function calculateDaimoGatewayFee(
  pledgeAmount: string,
  decimals: number = 6,
): bigint {
  debug &&
    console.log('[Gateway Fee] Calculating fee:', {
      pledgeAmount,
      decimals,
      feeBasisPoints: DAIMO_FEE_BASIS_POINTS.toString(),
      percentDivider: PERCENT_DIVIDER.toString(),
    });

  // Convert pledge amount to token units (e.g., $100 -> 100000000 for 6 decimals)
  const pledgeUnits = ethers.parseUnits(pledgeAmount, decimals);

  debug &&
    console.log('[Gateway Fee] Pledge in token units:', pledgeUnits.toString());

  // Calculate fee: (pledgeUnits * 200) / 10000 = 2% of pledge
  const feeUnits = (pledgeUnits * DAIMO_FEE_BASIS_POINTS) / PERCENT_DIVIDER;

  debug &&
    console.log('[Gateway Fee] Calculated fee:', {
      feeUnits: feeUnits.toString(),
      feePercentage: '2%',
      formula: `(${pledgeUnits} * ${DAIMO_FEE_BASIS_POINTS}) / ${PERCENT_DIVIDER}`,
    });

  return feeUnits;
}

/**
 * Convert gateway fee from token units back to human-readable format.
 *
 * @param feeUnits - Fee amount in token units (bigint)
 * @param decimals - Token decimals (default 6 for USDT/USDC)
 * @returns Fee amount in human-readable format (string)
 *
 * @example
 * const feeUnits = 2000000n; // 2 USDT in smallest units
 * const feeDisplay = formatGatewayFee(feeUnits, 6);
 * // Returns: "2.0"
 */
export function formatGatewayFee(
  feeUnits: bigint,
  decimals: number = 6,
): string {
  return ethers.formatUnits(feeUnits, decimals);
}

/**
 * Calculate the effective fee percentage for display purposes.
 *
 * @returns Fee percentage as a string (e.g., "2.00%")
 */
export function getDaimoFeePercentage(): string {
  const percentage = Number(DAIMO_FEE_BASIS_POINTS) / 100;
  return `${percentage.toFixed(2)}%`;
}

