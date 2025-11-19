import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getCampaign } from '@/lib/api/campaigns';
import { getTreasuryTransactions } from '@/lib/treasury/transactions';
import {
  getBlockExplorerTransactions,
  getBlockExplorerTransactionDetails,
} from '@/lib/block-explorer';
import { chainConfig } from '@/lib/web3/config/chain';
import { logFactory } from '@/lib/debug/log';

const logVerbose = logFactory('verbose', '⛓️ OnChainTx', { flag: 'api' });

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    await checkAuth(['admin']);

    const { campaignId } = await params;
    const campaignIdNum = parseInt(campaignId);

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
        const { celo } = await import('viem/chains');
        const publicClient = createPublicClient({
          chain: celo,
          transport: http(
            process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
          ),
        });

        logVerbose(
          `Checking contract at address: ${campaign.treasuryAddress}`,
          {
            rpcEndpoint:
              process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
          },
        );

        // First, let's check if we can get a balance for this address
        try {
          const balance = await publicClient.getBalance({
            address: campaign.treasuryAddress as `0x${string}`,
          });
          logVerbose(`Address balance check`, {
            balanceWei: balance.toString(),
          });
        } catch (balanceError) {
          console.error('Error getting balance:', balanceError);
        }

        const code = await publicClient.getCode({
          address: campaign.treasuryAddress as `0x${string}`,
        });
        logVerbose(`Contract code check`, { codeLength: code?.length || 0 });

        // If we get 0x, it might be a network issue - let's try a fallback RPC
        if (!code || code === '0x') {
          logVerbose(
            'Contract code is empty, trying alternative RPC endpoints',
          );

          // Use chain-appropriate fallback endpoints (public only)
          const fallbackEndpoints =
            chainConfig.chainId === 42220
              ? [
                  // Mainnet public endpoints
                  'https://rpc.ankr.com/celo',
                  'https://celo.api.onfinality.io/public',
                ]
              : [
                  // Sepolia testnet public endpoints
                  'https://rpc.ankr.com/celo_sepolia',
                  'https://celo-sepolia.api.onfinality.io/public',
                ];

          for (const endpoint of fallbackEndpoints) {
            try {
              logVerbose(`Trying fallback RPC`, { endpoint });
              const fallbackClient = createPublicClient({
                chain: celo,
                transport: http(endpoint),
              });

              const fallbackCode = await fallbackClient.getCode({
                address: campaign.treasuryAddress as `0x${string}`,
              });
              logVerbose(`Fallback RPC result`, {
                endpoint,
                codeLength: fallbackCode?.length || 0,
              });

              if (fallbackCode && fallbackCode !== '0x') {
                logVerbose('SUCCESS: Found contract code with fallback RPC');
                // Use this successful client for further operations
                // (We'd need to restructure the code to use this client)
                break;
              }
            } catch (fallbackError) {
              console.warn(`Fallback RPC ${endpoint} failed:`, fallbackError);
            }
          }
        }

        if (!code || code === '0x') {
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
