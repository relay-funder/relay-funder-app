import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getCampaign } from '@/lib/api/campaigns';
import { getTreasuryTransactions } from '@/lib/treasury/transactions';
import {
  getBlockExplorerTransactions,
  getBlockExplorerTransactionDetails,
  getBlockExplorerAddressTokenTransfers,
} from '@/lib/block-explorer';
import { logFactory } from '@/lib/debug/log';

const logVerbose = logFactory('verbose', '⛓️ OnChainTx', { flag: 'api' });

/**
 * Create a streaming response that sends transactions progressively
 * Uses Server-Sent Events (SSE) pattern for real-time updates
 */
async function createStreamingResponse(treasuryAddress: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Helper to send a JSON message to the client
        const sendMessage = (type: string, data: unknown) => {
          const message = `data: ${JSON.stringify({ type, data })}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Step 1: Fetch smart contract transactions
        logVerbose('Fetching smart contract transactions');
        const smartContractTransactions =
          await getTreasuryTransactions(treasuryAddress);
        sendMessage('smart_contract_transactions', smartContractTransactions);

        // Step 2: Get basic transaction list from block explorer
        logVerbose('Fetching block explorer transactions');
        let blockExplorerTransactions: any[] =
          await getBlockExplorerTransactions(treasuryAddress);

        // Augment tx list using token transfers so we don't miss transactions where the
        // treasury is only present in logs (e.g. relayers paying the treasury).
        try {
          const tokenTransfers =
            await getBlockExplorerAddressTokenTransfers(treasuryAddress);
          const relevantTransfers = tokenTransfers.filter(
            (t) => t.tokenSymbol === 'USDC' || t.tokenSymbol === 'USDT',
          );

          const existingHashes = new Set(
            blockExplorerTransactions
              .map((t) => t?.hash)
              .filter((h: unknown): h is string => typeof h === 'string'),
          );

          const missingTxHashes = Array.from(
            new Set(relevantTransfers.map((t) => t.transactionHash)),
          ).filter((h) => !existingHashes.has(h));

          for (const hash of missingTxHashes) {
            blockExplorerTransactions.push({ hash });
          }
        } catch (error) {
          logVerbose('Failed to augment tx list with token transfers', error);
        }

        if (blockExplorerTransactions.length === 0) {
          // Try alternative approach if no transactions found
          try {
            const { createPublicClient, http } = await import('viem');
            const { chainConfig } = await import('@/lib/web3/config/chain');

            const client = createPublicClient({
              chain: chainConfig.defaultChain,
              transport: http(chainConfig.rpcUrl),
            });

            const code = await client.getCode({
              address: treasuryAddress as `0x${string}`,
            });

            if (code && code !== '0x') {
              blockExplorerTransactions =
                await getBlockExplorerTransactions(treasuryAddress);
            }
          } catch (error) {
            logVerbose('Error checking contract:', error);
          }
        }

        sendMessage('transaction_count', {
          total: blockExplorerTransactions.length,
        });

        // Step 3: Fetch detailed transaction data one by one
        let processedCount = 0;
        for (const tx of blockExplorerTransactions) {
          try {
            logVerbose(`Fetching details for ${tx.hash}`);
            const detailedTx = await getBlockExplorerTransactionDetails(
              tx.hash,
            );

            if (detailedTx) {
              // Send individual transaction immediately
              sendMessage('transaction', detailedTx);
              processedCount++;
              logVerbose(
                `Sent transaction ${processedCount}/${blockExplorerTransactions.length}`,
              );
            } else {
              // Fallback to basic data
              sendMessage('transaction', tx);
              processedCount++;
            }
          } catch (error) {
            logVerbose(`Error fetching details for ${tx.hash}:`, error);
            // Send basic transaction data on error
            sendMessage('transaction', tx);
            processedCount++;
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Send completion message
        sendMessage('complete', { processedCount });
        controller.close();
      } catch (error) {
        logVerbose('Streaming error:', error);
        const errorMessage = `data: ${JSON.stringify({ type: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    await checkAuth(['admin']);

    const { campaignId } = await params;
    const campaignIdNum = parseInt(campaignId);
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get('stream') === 'true';

    if (isNaN(campaignIdNum)) {
      throw new ApiParameterError('Invalid campaign ID');
    }

    // Get campaign to verify it exists and get treasury address
    const campaign = await getCampaign(campaignIdNum);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (!campaign.treasuryAddress) {
      // Return empty array if no treasury deployed yet
      return response({ transactions: [], rawTransactions: [] });
    }

    // If streaming is requested, use streaming response
    if (stream) {
      return createStreamingResponse(campaign.treasuryAddress);
    }

    // Fetch on-chain transactions from the treasury
    // Scan from genesis since treasury contracts typically have only a few dozen transactions
    const smartContractTransactions = await getTreasuryTransactions(
      campaign.treasuryAddress,
    );

    // Extract transaction hashes from smart contract events to fetch detailed transaction data
    const transactionHashes = smartContractTransactions.map(
      (tx) => tx.transactionHash,
    );
    logVerbose(
      `Found ${transactionHashes.length} transaction hashes from smart contract events`,
      { transactionHashes },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let blockExplorerTransactions: any[] = [];

    // If no smart contract transactions, try to fetch regular transactions involving the treasury address
    if (transactionHashes.length === 0) {
      logVerbose(
        'No smart contract transactions found. Checking if treasury contract exists and fetching regular transactions',
      );

      try {
        const { createPublicClient, http } = await import('viem');
        const { chainConfig } = await import('@/lib/web3/config/chain');

        // Use the correct chain and RPC URL for the current environment
        // This ensures we only query the right network (mainnet in prod, testnet in staging/dev)
        const client = createPublicClient({
          chain: chainConfig.defaultChain,
          transport: http(chainConfig.rpcUrl),
        });

        let contractCode: string | undefined;

        try {
          logVerbose(
            `Checking treasury contract on ${chainConfig.name} network`,
          );

          // First, let's check if we can get a balance for this address
          try {
            const balance = await client.getBalance({
              address: campaign.treasuryAddress as `0x${string}`,
            });
            logVerbose(`Address balance check`, {
              network: chainConfig.name,
              balanceWei: balance.toString(),
            });
          } catch (balanceError) {
            console.error('Error getting balance:', balanceError);
          }

          const code = await client.getCode({
            address: campaign.treasuryAddress as `0x${string}`,
          });
          logVerbose(`Contract code check`, {
            network: chainConfig.name,
            codeLength: code?.length || 0,
          });

          // If we successfully get contract code, use this client
          if (code && code !== '0x') {
            contractCode = code;
            logVerbose('SUCCESS: Found contract code', {
              network: chainConfig.name,
            });
          }
        } catch (error) {
          console.warn(
            `Failed to check contract on ${chainConfig.name}:`,
            error,
          );
        }

        if (!contractCode || contractCode === '0x') {
          logVerbose(
            'Treasury contract does not exist at this address - this might be wrong',
          );

          // Let's try a different approach - check if we can get any transaction data
          logVerbose(
            'Attempting to fetch transactions anyway to see if address has activity',
          );
          blockExplorerTransactions = await getBlockExplorerTransactions(
            campaign.treasuryAddress,
          );
          logVerbose(`Found transactions despite no contract code`, {
            transactionCount: blockExplorerTransactions.length,
          });
        } else {
          logVerbose(
            'Treasury contract exists, trying to fetch regular transactions',
          );

          // If contract exists but has no smart contract events, try fetching regular transactions
          // This might happen if the treasury receives direct transfers
          blockExplorerTransactions = await getBlockExplorerTransactions(
            campaign.treasuryAddress,
          );
          logVerbose(`Fetched regular transactions for treasury address`, {
            transactionCount: blockExplorerTransactions.length,
          });
        }
      } catch (error) {
        console.error(
          'Error checking contract or fetching regular transactions:',
          error,
        );
      }
    }

    // Fetch raw block explorer transactions - get basic list first, then fetch detailed data for all
    logVerbose('Fetching block explorer transactions for treasury address');

    if (blockExplorerTransactions.length === 0) {
      try {
        // First get basic transaction list
        blockExplorerTransactions = await getBlockExplorerTransactions(
          campaign.treasuryAddress,
        );
        logVerbose('Basic block explorer transactions fetched', {
          transactionCount: blockExplorerTransactions.length,
        });
      } catch (blockExplorerError) {
        console.warn(
          'Failed to fetch basic block explorer transactions:',
          blockExplorerError,
        );
        blockExplorerTransactions = [];
      }
    }

    // Augment tx list using token transfers so we don't miss transactions where the
    // treasury is only present in logs (e.g. relayers paying the treasury).
    try {
      const tokenTransfers = await getBlockExplorerAddressTokenTransfers(
        campaign.treasuryAddress,
      );
      const relevantTransfers = tokenTransfers.filter(
        (t) => t.tokenSymbol === 'USDC' || t.tokenSymbol === 'USDT',
      );

      const existingHashes = new Set(
        blockExplorerTransactions
          .map((t) => t?.hash)
          .filter((h: unknown): h is string => typeof h === 'string'),
      );

      const missingTxHashes = Array.from(
        new Set(relevantTransfers.map((t) => t.transactionHash)),
      ).filter((h) => !existingHashes.has(h));

      for (const hash of missingTxHashes) {
        blockExplorerTransactions.push({ hash });
      }

      if (missingTxHashes.length > 0) {
        logVerbose('Augmented block explorer tx list using token transfers', {
          added: missingTxHashes.length,
        });
      }
    } catch (error) {
      logVerbose('Failed to augment tx list with token transfers', error);
    }

    // Now fetch detailed data for ALL transactions to get token transfer amounts
    if (blockExplorerTransactions.length > 0) {
      logVerbose(`Fetching detailed data for transactions`, {
        transactionCount: blockExplorerTransactions.length,
      });
      const detailedTransactions = [];

      for (const tx of blockExplorerTransactions) {
        logVerbose(`Fetching detailed data for transaction`, { hash: tx.hash });
        try {
          const detailedTx = await getBlockExplorerTransactionDetails(tx.hash);
          if (detailedTx) {
            detailedTransactions.push(detailedTx);
            logVerbose(`Successfully fetched details for transaction`, {
              hash: tx.hash,
              tokenTransferCount: detailedTx.tokenTransfers?.length || 0,
            });
          } else {
            console.warn(
              `Failed to fetch details for transaction ${tx.hash}, using basic data`,
            );
            // Fallback to basic transaction data if detailed fetch fails
            detailedTransactions.push(tx);
          }
        } catch (detailError) {
          console.warn(
            `Error fetching details for transaction ${tx.hash}:`,
            detailError,
          );
          // Fallback to basic transaction data
          detailedTransactions.push(tx);
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      blockExplorerTransactions = detailedTransactions;
      logVerbose('Final block explorer transactions with details', {
        finalTransactionCount: blockExplorerTransactions.length,
      });
    }

    logVerbose('API Response transaction counts', {
      smartContractTransactions: smartContractTransactions.length,
      blockExplorerTransactions: blockExplorerTransactions.length,
    });

    return response({
      transactions: smartContractTransactions,
      rawTransactions: blockExplorerTransactions,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
