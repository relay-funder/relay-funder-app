import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { chainConfig } from '@/lib/web3/config/chain';
import { USD_ADDRESS } from '@/lib/constant';
import { USD_DECIMALS } from '@/lib/constant/tokens';
import { logFactory } from '@/lib/debug/log';
import type { OnChainTransaction } from '@/lib/hooks/useOnChainTransactions';

const logVerbose = logFactory('verbose', '💰 Treasury', { flag: 'web3' });

// Create a public client for reading from the blockchain using the proper chain configuration
// This ensures we use testnet endpoints in development and mainnet in production
const publicClient = createPublicClient({
  chain: chainConfig.defaultChain,
  transport: http(chainConfig.rpcUrl),
});

/**
 * Fetch pledge and withdrawal transactions from a KeepWhat'sRaised treasury contract
 * Uses smart block ranges and fallback strategies to avoid RPC timeouts
 */
export async function getTreasuryTransactions(
  treasuryAddress: string,
  options: {
    fromBlock?: bigint; // Specific starting block (optional)
  } = {},
): Promise<OnChainTransaction[]> {
  try {
    const contractAddress = treasuryAddress as `0x${string}`;

    // Use smart block ranges to avoid timeouts - start from recent blocks but allow full history
    // Treasury contracts have few transactions, but RPC endpoints timeout on large block ranges
    const currentBlock = await publicClient.getBlockNumber();
    const startBlock = options.fromBlock || currentBlock - 200000n; // Last ~4 weeks on Celo

    // Ensure we don't go below genesis
    const safeStartBlock = startBlock < 0n ? 0n : startBlock;

    logVerbose(`Fetching treasury transactions`, {
      fromBlock: safeStartBlock,
      toBlock: currentBlock,
      blockRange: currentBlock - safeStartBlock,
    });

    // Try to fetch events with timeout protection
    type LogEntry = {
      address: `0x${string}`;
      topics: `0x${string}`[];
      data: `0x${string}`;
      blockNumber: bigint;
      transactionHash: `0x${string}`;
      transactionIndex: number;
      blockHash: `0x${string}`;
      logIndex: number;
      removed: boolean;
      args?: {
        backer?: `0x${string}`;
        reward?: `0x${string}`;
        pledgeAmount?: bigint;
        tip?: bigint;
        tokenId?: bigint;
        rewards?: readonly `0x${string}`[];
        to?: `0x${string}`;
        amount?: bigint;
        fee?: bigint;
      };
    };

    let receiptEvents:
      | PromiseSettledResult<LogEntry[]>
      | { status: 'rejected'; reason: unknown }
      | undefined;
    let withdrawalEvents:
      | PromiseSettledResult<LogEntry[]>
      | { status: 'rejected'; reason: unknown }
      | undefined;

    try {
      // First attempt: fetch both event types in parallel
      const results = await Promise.allSettled([
        // Get Receipt events (pledges) from genesis (treasuries have few transactions)
        publicClient.getLogs({
          address: contractAddress,
          event: {
            type: 'event',
            name: 'Receipt',
            inputs: [
              { type: 'address', name: 'backer', indexed: true },
              { type: 'bytes32', name: 'reward', indexed: true },
              { type: 'uint256', name: 'pledgeAmount', indexed: false },
              { type: 'uint256', name: 'tip', indexed: false },
              { type: 'uint256', name: 'tokenId', indexed: false },
              { type: 'bytes32[]', name: 'rewards', indexed: false },
            ],
          },
          fromBlock: safeStartBlock,
          toBlock: currentBlock,
        }),

        // Get Withdrawal events with same block range
        publicClient.getLogs({
          address: contractAddress,
          event: {
            type: 'event',
            name: 'WithdrawalWithFeeSuccessful',
            inputs: [
              { type: 'address', name: 'to', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false },
              { type: 'uint256', name: 'fee', indexed: false },
            ],
          },
          fromBlock: safeStartBlock,
          toBlock: currentBlock,
        }),
      ]);

      receiptEvents = results[0] as PromiseSettledResult<LogEntry[]>;
      withdrawalEvents = results[1] as PromiseSettledResult<LogEntry[]>;
    } catch (error) {
      console.warn('Parallel fetch failed, trying sequential approach:', error);

      // Fallback: try sequential requests with smaller timeout expectations
      try {
        const receiptData = await Promise.race([
          publicClient.getLogs({
            address: contractAddress,
            event: {
              type: 'event',
              name: 'Receipt',
              inputs: [
                { type: 'address', name: 'backer', indexed: true },
                { type: 'bytes32', name: 'reward', indexed: true },
                { type: 'uint256', name: 'pledgeAmount', indexed: false },
                { type: 'uint256', name: 'tip', indexed: false },
                { type: 'uint256', name: 'tokenId', indexed: false },
                { type: 'bytes32[]', name: 'rewards', indexed: false },
              ],
            },
            fromBlock: safeStartBlock,
            toBlock: currentBlock,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Receipt events timeout')),
              15000,
            ),
          ),
        ]);
        receiptEvents = {
          status: 'fulfilled',
          value: receiptData as LogEntry[],
        };
      } catch (receiptError) {
        console.warn('Failed to fetch receipt events:', receiptError);
        receiptEvents = { status: 'rejected', reason: receiptError };
      }

      try {
        const withdrawalData = await Promise.race([
          publicClient.getLogs({
            address: contractAddress,
            event: {
              type: 'event',
              name: 'WithdrawalWithFeeSuccessful',
              inputs: [
                { type: 'address', name: 'to', indexed: true },
                { type: 'uint256', name: 'amount', indexed: false },
                { type: 'uint256', name: 'fee', indexed: false },
              ],
            },
            fromBlock: safeStartBlock,
            toBlock: currentBlock,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Withdrawal events timeout')),
              15000,
            ),
          ),
        ]);
        withdrawalEvents = {
          status: 'fulfilled',
          value: withdrawalData as LogEntry[],
        };
      } catch (withdrawalError) {
        console.warn('Failed to fetch withdrawal events:', withdrawalError);
        withdrawalEvents = { status: 'rejected', reason: withdrawalError };
      }
    }

    // Handle partial failures gracefully
    const receiptEventsData =
      receiptEvents?.status === 'fulfilled' ? receiptEvents.value : [];
    const withdrawalEventsData =
      withdrawalEvents?.status === 'fulfilled' ? withdrawalEvents.value : [];

    if (receiptEvents && receiptEvents.status === 'rejected') {
      console.warn('Failed to fetch pledge events:', receiptEvents.reason);
    }
    if (withdrawalEvents && withdrawalEvents.status === 'rejected') {
      console.warn(
        'Failed to fetch withdrawal events:',
        withdrawalEvents.reason,
      );
    }

    // Process pledge events
    const pledgeTransactions: OnChainTransaction[] = await Promise.all(
      receiptEventsData.map(async (event) => {
        const block = await publicClient.getBlock({
          blockHash: event.blockHash,
        });

        return {
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber),
          timestamp: Number(block.timestamp),
          amount: formatUnits(event.args?.pledgeAmount || 0n, USD_DECIMALS), // USDT has USD_DECIMALS decimals
          token: 'USDT',
          from: event.args?.backer || 'unknown',
          to: treasuryAddress,
          pledgeId: event.args?.reward,
          tipAmount: formatUnits(event.args?.tip || 0n, USD_DECIMALS),
          eventType: 'pledge',
        };
      }),
    );

    // Process withdrawal events
    const withdrawalTransactions: OnChainTransaction[] = await Promise.all(
      withdrawalEventsData.map(async (event) => {
        const block = await publicClient.getBlock({
          blockHash: event.blockHash,
        });

        return {
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber),
          timestamp: Number(block.timestamp),
          amount: formatUnits(event.args?.amount || 0n, USD_DECIMALS), // USDT has USD_DECIMALS decimals
          token: 'USDT',
          from: treasuryAddress,
          to: event.args?.to || 'unknown',
          fee: formatUnits(event.args?.fee || 0n, USD_DECIMALS),
          eventType: 'withdrawal',
        };
      }),
    );

    // Combine and sort by timestamp (newest first)
    const allTransactions = [
      ...pledgeTransactions,
      ...withdrawalTransactions,
    ].sort((a, b) => b.timestamp - a.timestamp);

    logVerbose(`Fetched treasury transactions`, {
      totalTransactions: allTransactions.length,
      pledges: pledgeTransactions.length,
      withdrawals: withdrawalTransactions.length,
    });

    return allTransactions;
  } catch (error) {
    console.error('Error fetching treasury transactions:', error);

    // Provide more specific error information
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error(
        'RPC timeout occurred. Consider using a paid RPC service for production.',
      );
    }

    // Return empty array on error to avoid breaking the UI
    return [];
  }
}

/**
 * Get current treasury balance from the contract
 */
export async function getTreasuryContractBalance(
  treasuryAddress: string,
): Promise<{ usd: string; native: string }> {
  try {
    const contractAddress = treasuryAddress as `0x${string}`;

    // First try to get USD balance using contract call (preferred method)
    let usdBalance: bigint | null = null;
    try {
      usdBalance = (await publicClient.readContract({
        address: contractAddress,
        abi: KeepWhatsRaisedABI,
        functionName: 'getRaisedAmount',
      })) as bigint;
      logVerbose(`Treasury contract getRaisedAmount`, {
        amount: formatUnits(usdBalance, USD_DECIMALS),
      });
    } catch (contractError) {
      console.warn(
        'Failed to call getRaisedAmount on treasury contract:',
        contractError,
      );
      usdBalance = null;
    }

    // If contract call fails, try to get USD token balance directly from ERC20 contract
    if (usdBalance === null) {
      try {
        // Use the configured USD token contract address (USDT in production, USDC in staging)
        const usdTokenAddress = USD_ADDRESS as `0x${string}`;

        // ERC20 balanceOf call
        usdBalance = (await publicClient.readContract({
          address: usdTokenAddress,
          abi: [
            {
              constant: true,
              inputs: [{ name: '_owner', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ name: 'balance', type: 'uint256' }],
              type: 'function',
            },
          ],
          functionName: 'balanceOf',
          args: [contractAddress],
        })) as bigint;
        logVerbose(`Direct USD token balance check`, {
          chain: chainConfig.name,
          amount: formatUnits(usdBalance, USD_DECIMALS),
        });
      } catch (erc20Error) {
        console.warn('Failed to get USD token balance directly:', erc20Error);
        usdBalance = 0n;
      }
    }

    // Get native token balance
    const nativeBalance = await publicClient.getBalance({
      address: contractAddress,
    });

    return {
      usd: formatUnits(usdBalance, USD_DECIMALS), // USD tokens have USD_DECIMALS decimals
      native: formatEther(nativeBalance),
    };
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return { usd: '0', native: '0' };
  }
}
