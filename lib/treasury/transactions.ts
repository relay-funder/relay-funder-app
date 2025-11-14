import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { chainConfig } from '@/lib/web3/config/chain';
import type { OnChainTransaction } from '@/components/admin/campaigns/reconciliation/hooks/useOnChainTransactions';

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

    console.log(
      `Fetching treasury transactions from block ${safeStartBlock} to ${currentBlock} (${currentBlock - safeStartBlock} blocks)`,
    );

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
          amount: formatUnits(event.args?.pledgeAmount || 0n, 6), // USDT has 6 decimals
          token: 'USDT',
          from: event.args?.backer || 'unknown',
          to: treasuryAddress,
          pledgeId: event.args?.reward,
          tipAmount: formatUnits(event.args?.tip || 0n, 6),
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
          amount: formatUnits(event.args?.amount || 0n, 6), // USDT has 6 decimals
          token: 'USDT',
          from: treasuryAddress,
          to: event.args?.to || 'unknown',
          fee: formatUnits(event.args?.fee || 0n, 6),
          eventType: 'withdrawal',
        };
      }),
    );

    // Combine and sort by timestamp (newest first)
    const allTransactions = [
      ...pledgeTransactions,
      ...withdrawalTransactions,
    ].sort((a, b) => b.timestamp - a.timestamp);

    console.log(
      `Fetched ${allTransactions.length} transactions (${pledgeTransactions.length} pledges, ${withdrawalTransactions.length} withdrawals)`,
    );

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
): Promise<{ usdt: string; native: string }> {
  try {
    const contractAddress = treasuryAddress as `0x${string}`;

    // First try to get USDT balance using contract call (preferred method)
    let usdtBalance: bigint | null = null;
    try {
      usdtBalance = (await publicClient.readContract({
        address: contractAddress,
        abi: KeepWhatsRaisedABI,
        functionName: 'getRaisedAmount',
      })) as bigint;
      console.log(
        `Treasury contract getRaisedAmount:`,
        formatUnits(usdtBalance, 6),
      );
    } catch (contractError) {
      console.warn(
        'Failed to call getRaisedAmount on treasury contract:',
        contractError,
      );
      usdtBalance = null;
    }

    // If contract call fails, try to get USDC balance directly from ERC20 contract
    if (usdtBalance === null) {
      try {
        // Use the appropriate USDC contract address based on the chain
        const usdcAddress = (
          chainConfig.chainId === 42220
            ? '0x01C5C0122039549AD1493B8220cABEdD739BC44E' // Mainnet USDC
            : '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B'
        ) as  // Sepolia USDC
        `0x${string}`;

        // ERC20 balanceOf call
        usdtBalance = (await publicClient.readContract({
          address: usdcAddress,
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
        console.log(
          `Direct USDC balance check on ${chainConfig.name}:`,
          formatUnits(usdtBalance, 6),
        );
      } catch (erc20Error) {
        console.warn('Failed to get USDC balance directly:', erc20Error);
        usdtBalance = 0n;
      }
    }

    // Get native token balance
    const nativeBalance = await publicClient.getBalance({
      address: contractAddress,
    });

    return {
      usdt: formatUnits(usdtBalance, 6), // USDC has 6 decimals
      native: formatEther(nativeBalance),
    };
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return { usdt: '0', native: '0' };
  }
}
