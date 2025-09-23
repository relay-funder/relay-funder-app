import { useCallback, useState } from 'react';
import {
  encodeAbiParameters,
  parseAbiParameters,
  ethers,
  useWriteContract,
} from '@/lib/web3';
import { KickStarterQFABI } from '@/contracts/abi/qf/KickStarterQF';

export interface ExecutePayoutCampaignLike {
  recipientAddress?: string | null;
  suggestedMatch?: number | null;
  amount?: number | null;
  payoutScaled?: number | null;
}

export interface ExecutePayoutParams {
  strategyAddress: string;
  campaigns: ExecutePayoutCampaignLike[];
  decimals?: number; // defaults to NEXT_PUBLIC_USDC_DECIMALS or 6
}

export interface ExecutePayoutResult {
  hash?: string;
}

/**
 * Pure utility to prepare recipients/amounts arrays and the encoded calldata
 * for `setPayout(bytes)`.
 */
export function buildSetPayoutCalldata({
  campaigns,
  decimals,
}: {
  campaigns: ExecutePayoutCampaignLike[];
  decimals?: number;
}): {
  recipients: string[];
  amounts: bigint[];
  data: `0x${string}`;
} {
  const resolvedDecimals = (() => {
    if (typeof decimals === 'number' && Number.isFinite(decimals)) {
      return Math.max(0, Math.floor(decimals));
    }
    const s = process.env.NEXT_PUBLIC_USDC_DECIMALS;
    const n = s ? parseInt(s) : NaN;
    return Number.isFinite(n) ? n : 6;
  })();

  const recipients: `0x${string}`[] = [];
  const amounts: bigint[] = [];

  for (const c of campaigns || []) {
    const addr =
      typeof c?.recipientAddress === 'string' ? c.recipientAddress : '';
    if (!isHexAddress(addr)) {
      // Skip invalid recipient entries
      // eslint-disable-next-line no-console
      console.warn('Skipping entry with missing/invalid recipientAddress', c);
      continue;
    }
    // Choose a numeric source in priority order: suggestedMatch -> amount -> payoutScaled
    const numeric =
      (isFiniteNumber(c?.suggestedMatch)
        ? Number(c?.suggestedMatch)
        : undefined) ??
      (isFiniteNumber(c?.amount) ? Number(c?.amount) : undefined) ??
      (isFiniteNumber(c?.payoutScaled) ? Number(c?.payoutScaled) : undefined) ??
      0;

    const nonNegative = Math.max(0, numeric);
    const scaled = ethers.parseUnits(String(nonNegative), resolvedDecimals);

    recipients.push(addr);
    amounts.push(scaled);
  }

  if (recipients.length === 0) {
    throw new Error('No valid recipients found to encode payout');
  }

  const data = encodeAbiParameters(
    parseAbiParameters(['address[] _recipientIds', 'uint256[] _amounts']),
    [recipients, amounts],
  ) as `0x${string}`;

  return { recipients, amounts, data };
}

/**
 * React hook to execute `setPayout(bytes)` on the QF strategy contract.
 * All chain-specific logic is encapsulated here.
 *
 * Usage:
 * const { executePayout, isExecuting, error, lastTxHash } = useExecutePayout();
 * await executePayout({ strategyAddress, campaigns, decimals });
 */
export function useExecutePayout() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();
  const executePayout = useCallback(
    async ({
      strategyAddress,
      campaigns,
      decimals,
    }: ExecutePayoutParams): Promise<ExecutePayoutResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!isHexAddress(strategyAddress)) {
        throw new Error(
          'Please provide a valid on-chain strategy address (0x...)',
        );
      }

      try {
        setIsExecuting(true);

        // Build calldata for setPayout(bytes)
        const { data } = buildSetPayoutCalldata({ campaigns, decimals });

        // Perform contract write

        const abi = KickStarterQFABI?.abi;

        const tx = await writeContract({
          address: strategyAddress as `0x${string}`,
          abi,
          functionName: 'setPayout',
          args: [data],
        });

        const hash: string | undefined = tx;
        setLastTxHash(hash);
        return { hash };
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [writeContract],
  );

  return { executePayout, isExecuting, error, lastTxHash };
}

/** Internal helpers */
function isHexAddress(s: unknown): s is `0x${string}` {
  return typeof s === 'string' && /^0x[a-fA-F0-9]{40}$/.test(s);
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}
