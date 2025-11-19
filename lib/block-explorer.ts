import { chainConfig } from '@/lib/web3/config/chain';

/**
 * Get the appropriate block explorer API URL for the current chain
 */
function getBlockExplorerApiUrl(endpoint: string): string {
  const baseUrl = chainConfig.blockExplorerUrl.replace(/\/$/, '');
  return `${baseUrl}/api/v2${endpoint}`;
}

interface BlockExplorerLogEntry {
  topics?: string[];
  data?: string;
  address?: string;
}

interface BlockExplorerTokenTransferRaw {
  token?: {
    symbol?: string;
    address?: string;
    decimals?: string;
  };
  total?: {
    value?: string;
  };
  value?: string;
  from?: string | { hash?: string };
  to?: string | { hash?: string };
}

interface BlockExplorerTransactionRaw {
  hash?: string;
  timestamp?: string | number;
  block?: string;
  block_number?: string;
  from?: string | { hash?: string };
  to?: string | { hash?: string; is_contract?: boolean };
  value?: string;
  gas_used?: string;
  gas_price?: string;
  fee?: { value?: string };
  status?: string;
  result?: string;
  method?: string;
  token_transfers?: BlockExplorerTokenTransferRaw[];
  logs?: BlockExplorerLogEntry[];
}

export interface TokenTransfer {
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  decimals: number;
  from: string;
  to: string;
}

export interface BlockExplorerTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  fee: string;
  status: 'success' | 'failed';
  method?: string;
  type: 'native' | 'erc20' | 'contract';
  tokenTransfers?: TokenTransfer[];
}

/**
 * Parse common transaction fields from block explorer API response
 * Used to avoid code duplication between transaction parsing functions
 */
function parseTransactionFields(tx: BlockExplorerTransactionRaw): {
  timestamp: number;
  blockNumber: number;
  fromAddress: string;
  toAddress: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  fee: string;
  status: 'success' | 'failed';
  method?: string;
  type: 'native' | 'erc20' | 'contract';
} {
  // Parse timestamp
  let timestamp = 0;
  const timestampField = tx.timestamp;
  if (timestampField) {
    if (typeof timestampField === 'string') {
      const parsedDate = new Date(timestampField);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = Math.floor(parsedDate.getTime() / 1000);
      }
    } else if (typeof timestampField === 'number') {
      timestamp =
        timestampField > 1000000000000
          ? Math.floor(timestampField / 1000)
          : timestampField;
    }
  }

  // Parse block number
  const blockNumber = parseInt(tx.block || tx.block_number || '0');

  // Extract addresses
  const fromAddress =
    typeof tx.from === 'object' && tx.from?.hash
      ? tx.from.hash
      : typeof tx.from === 'string'
        ? tx.from
        : '';
  const toAddress =
    typeof tx.to === 'object' && tx.to?.hash
      ? tx.to.hash
      : typeof tx.to === 'string'
        ? tx.to
        : '';

  // Parse value
  const value = tx.value || '0';

  // Parse gas details
  const gasUsed = tx.gas_used || '0';
  const gasPrice = tx.gas_price || '0';

  // Calculate fee
  let fee = '0';
  if (tx.fee?.value) {
    fee = tx.fee.value;
  } else if (gasUsed && gasPrice) {
    try {
      fee = (BigInt(gasUsed) * BigInt(gasPrice)).toString();
    } catch {
      fee = '0';
    }
  }

  // Parse status
  const status: 'success' | 'failed' =
    tx.status === 'ok' || tx.result === 'success' ? 'success' : 'failed';

  // Parse method
  const method = tx.method || undefined;

  // Determine type
  const type = determineTransactionType(tx);

  return {
    timestamp,
    blockNumber,
    fromAddress,
    toAddress,
    value,
    gasUsed,
    gasPrice,
    fee,
    status,
    method,
    type,
  };
}

/**
 * Fetch transactions from block explorer API
 * Makes a direct call to Blockscout V2 API endpoint
 */
export async function getBlockExplorerTransactions(
  address: string,
): Promise<BlockExplorerTransaction[]> {
  const normalizedAddress = address.toLowerCase();

  try {
    // Direct call to Blockscout V2 transactions endpoint
    const apiUrl = getBlockExplorerApiUrl(
      `/addresses/${normalizedAddress}/transactions`,
    );

    console.log(`Fetching transactions from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Block explorer API failed with status ${response.status}`);
      return [];
    }

    const data = (await response.json()) as {
      items?: BlockExplorerTransactionRaw[];
    };
    const rawTransactions: BlockExplorerTransactionRaw[] = data.items || [];

    console.log(
      `Received ${rawTransactions.length} transactions from block explorer`,
    );

    if (rawTransactions.length === 0) {
      console.warn('No transactions found in API response');
      return [];
    }

    // Convert to our format
    const transactions = rawTransactions.map(
      (tx: BlockExplorerTransactionRaw) => {
        const {
          timestamp,
          blockNumber,
          fromAddress,
          toAddress,
          value,
          gasUsed,
          gasPrice,
          fee,
          status,
          method,
          type,
        } = parseTransactionFields(tx);

        // Parse token transfers
        const tokenTransfers: TokenTransfer[] = [];
        if (tx.token_transfers && Array.isArray(tx.token_transfers)) {
          for (const transfer of tx.token_transfers) {
            const tokenSymbol = transfer.token?.symbol || 'UNKNOWN';
            const tokenAddress = transfer.token?.address || '';
            const decimals = parseInt(transfer.token?.decimals || '0');
            const amount = transfer.total?.value || transfer.value || '0';
            const transferFrom =
              typeof transfer.from === 'object' && transfer.from?.hash
                ? transfer.from.hash
                : typeof transfer.from === 'string'
                  ? transfer.from
                  : '';
            const transferTo =
              typeof transfer.to === 'object' && transfer.to?.hash
                ? transfer.to.hash
                : typeof transfer.to === 'string'
                  ? transfer.to
                  : '';

            tokenTransfers.push({
              tokenSymbol,
              tokenAddress,
              amount,
              decimals,
              from: transferFrom,
              to: transferTo,
            });
          }
        }

        return {
          hash: tx.hash || '',
          blockNumber,
          timestamp,
          from: fromAddress,
          to: toAddress,
          value,
          gasUsed,
          gasPrice,
          fee,
          status,
          method,
          type,
          tokenTransfers:
            tokenTransfers.length > 0 ? tokenTransfers : undefined,
        };
      },
    );

    console.log(
      `Returning ${transactions.length} transactions for address ${normalizedAddress}`,
    );
    return transactions;
  } catch (error) {
    console.error('Error fetching block explorer transactions:', error);
    return [];
  }
}

/**
 * Determine transaction type based on transaction data
 */
function determineTransactionType(
  tx: BlockExplorerTransactionRaw,
): 'native' | 'erc20' | 'contract' {
  // Check if it's an ERC20 transfer
  if (tx.token_transfers && tx.token_transfers.length > 0) {
    return 'erc20';
  }

  // Check if it's a contract interaction
  if ((typeof tx.to === 'object' && tx.to?.is_contract) || tx.method) {
    return 'contract';
  }

  // Default to native transfer
  return 'native';
}

/**
 * Get block explorer URL for a transaction
 */
export function getBlockExplorerTxUrl(txHash: string): string {
  if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
    console.warn('Invalid transaction hash for URL generation:', txHash);
    return '';
  }
  const baseUrl = chainConfig.blockExplorerUrl.replace(/\/$/, '');
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get block explorer URL for an address
 */
export function getBlockExplorerAddressUrl(address: string): string {
  if (!address || address.length !== 42) {
    return '';
  }
  const baseUrl = chainConfig.blockExplorerUrl.replace(/\/$/, '');
  return `${baseUrl}/address/${address}`;
}

/**
 * Format Wei value to human-readable CELO value
 * Converts Wei (18 decimals) to CELO
 */
export function formatCeloValue(valueInWei: string | number): string {
  try {
    const value =
      typeof valueInWei === 'string' ? valueInWei : valueInWei.toString();
    const valueBigInt = BigInt(value);
    const divisor = BigInt(10 ** 18);

    const wholePart = valueBigInt / divisor;
    const remainder = valueBigInt % divisor;

    // Format with 6 decimal places
    const decimalPart = remainder.toString().padStart(18, '0').slice(0, 6);

    return `${wholePart}.${decimalPart}`;
  } catch {
    return '0.000000';
  }
}

/**
 * Fetch detailed transaction information including token transfers
 * Makes a call to Blockscout V2 transaction details endpoint
 */
export async function getBlockExplorerTransactionDetails(
  txHash: string,
): Promise<BlockExplorerTransaction | null> {
  try {
    const apiUrl = getBlockExplorerApiUrl(`/transactions/${txHash}`);

    console.log(`Fetching transaction details from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        `Block explorer transaction details API failed with status ${response.status}`,
      );
      return null;
    }

    const tx = (await response.json()) as BlockExplorerTransactionRaw;

    // Also try to fetch token transfers and internal transactions for this transaction
    const additionalTokenTransfers: TokenTransfer[] = [];
    try {
      // Try token transfers endpoint
      const tokenTransfersUrl = getBlockExplorerApiUrl(
        `/transactions/${txHash}/token-transfers`,
      );
      console.log(`Fetching token transfers from: ${tokenTransfersUrl}`);

      const tokenResponse = await fetch(tokenTransfersUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.items && Array.isArray(tokenData.items)) {
          console.log(
            `Found ${tokenData.items.length} token transfers via dedicated API`,
          );
          for (const transfer of tokenData.items) {
            const tokenSymbol = transfer.token?.symbol || 'UNKNOWN';
            const tokenAddress = transfer.token?.address || '';
            const decimals = parseInt(transfer.token?.decimals || '0');
            const amount =
              transfer.total?.value || transfer.value || transfer.amount || '0';
            const transferFrom =
              typeof transfer.from === 'object' && transfer.from?.hash
                ? transfer.from.hash
                : typeof transfer.from === 'string'
                  ? transfer.from
                  : '';
            const transferTo =
              typeof transfer.to === 'object' && transfer.to?.hash
                ? transfer.to.hash
                : typeof transfer.to === 'string'
                  ? transfer.to
                  : '';

            additionalTokenTransfers.push({
              tokenSymbol,
              tokenAddress,
              amount,
              decimals,
              from: transferFrom,
              to: transferTo,
            });
          }
        }
      }

      // Also try internal transactions endpoint
      const internalTxUrl = getBlockExplorerApiUrl(
        `/transactions/${txHash}/internal-transactions`,
      );
      console.log(`Fetching internal transactions from: ${internalTxUrl}`);

      const internalResponse = await fetch(internalTxUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (internalResponse.ok) {
        const internalData = await internalResponse.json();
        if (internalData.items && Array.isArray(internalData.items)) {
          console.log(
            `Found ${internalData.items.length} internal transactions`,
          );
          // Process internal transactions that involve token transfers
          for (const internalTx of internalData.items) {
            if (
              internalTx.type === 'call' &&
              internalTx.action?.token_transfers
            ) {
              // This internal transaction involves token transfers
              for (const transfer of internalTx.action.token_transfers) {
                const tokenSymbol = transfer.token?.symbol || 'UNKNOWN';
                const tokenAddress = transfer.token?.address || '';
                const decimals = parseInt(transfer.token?.decimals || '0');
                const amount = transfer.value || transfer.amount || '0';
                const transferFrom =
                  typeof transfer.from === 'object' && transfer.from?.hash
                    ? transfer.from.hash
                    : typeof transfer.from === 'string'
                      ? transfer.from
                      : '';
                const transferTo =
                  typeof transfer.to === 'object' && transfer.to?.hash
                    ? transfer.to.hash
                    : typeof transfer.to === 'string'
                      ? transfer.to
                      : '';

                additionalTokenTransfers.push({
                  tokenSymbol,
                  tokenAddress,
                  amount,
                  decimals,
                  from: transferFrom,
                  to: transferTo,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(
        `Failed to fetch additional transaction data for ${txHash}:`,
        error,
      );
    }

    // Debug: Log key fields for troubleshooting
    console.log(
      `Transaction ${txHash} has token_transfers: ${!!tx.token_transfers}, logs: ${!!tx.logs}`,
    );

    const {
      timestamp,
      blockNumber,
      fromAddress,
      toAddress,
      value,
      gasUsed,
      gasPrice,
      fee,
      status,
      method,
      type,
    } = parseTransactionFields(tx);

    // Parse token transfers - combine from multiple sources with deduplication
    const tokenTransfers: TokenTransfer[] = [];
    const transferKey = (transfer: TokenTransfer) =>
      `${transfer.from}-${transfer.to}-${transfer.amount}-${transfer.tokenAddress}`;

    // Helper function to add transfer if not already present
    const addTransferIfUnique = (transfer: TokenTransfer) => {
      const key = transferKey(transfer);
      if (!tokenTransfers.some((existing) => transferKey(existing) === key)) {
        tokenTransfers.push(transfer);
        console.log(
          `Added unique transfer: ${transfer.amount} ${transfer.tokenSymbol} from ${transfer.from} to ${transfer.to}`,
        );
      } else {
        console.log(
          `Skipped duplicate transfer: ${transfer.amount} ${transfer.tokenSymbol} from ${transfer.from} to ${transfer.to}`,
        );
      }
    };

    // Add token transfers from the dedicated API call first
    if (additionalTokenTransfers.length > 0) {
      console.log(
        `Adding ${additionalTokenTransfers.length} token transfers from dedicated API`,
      );
      additionalTokenTransfers.forEach(addTransferIfUnique);
    }

    // Check for additional token transfers in transaction details

    // Try token_transfers from transaction details
    if (tx.token_transfers && Array.isArray(tx.token_transfers)) {
      console.log(
        `Found ${tx.token_transfers.length} token transfers in token_transfers field for ${txHash}`,
      );
      for (const transfer of tx.token_transfers) {
        console.log(`Processing transfer from token_transfers:`, transfer);
        const tokenSymbol = transfer.token?.symbol || 'UNKNOWN';
        const tokenAddress = transfer.token?.address || '';
        const decimals = parseInt(transfer.token?.decimals || '0');
        const amount = transfer.total?.value || transfer.value || '0';
        const transferFrom =
          typeof transfer.from === 'object' && transfer.from?.hash
            ? transfer.from.hash
            : typeof transfer.from === 'string'
              ? transfer.from
              : '';
        const transferTo =
          typeof transfer.to === 'object' && transfer.to?.hash
            ? transfer.to.hash
            : typeof transfer.to === 'string'
              ? transfer.to
              : '';

        console.log(
          `Parsed transfer: ${amount} ${tokenSymbol} from ${transferFrom} to ${transferTo}`,
        );

        addTransferIfUnique({
          tokenSymbol,
          tokenAddress,
          amount,
          decimals,
          from: transferFrom,
          to: transferTo,
        });
      }
    }
    // Try logs as fallback for ERC20 transfers
    else if (tx.logs && Array.isArray(tx.logs)) {
      console.log(`Checking logs for ERC20 transfers in ${txHash}`);
      for (const log of tx.logs) {
        // ERC20 Transfer event signature: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        if (
          log.topics &&
          log.topics[0] ===
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        ) {
          console.log(`Found ERC20 Transfer event in log:`, log);

          // Parse the log data to extract transfer information
          try {
            const from = '0x' + log.topics[1].slice(-40);
            const to = '0x' + log.topics[2].slice(-40);
            const amountHex = log.data || '0x0';
            const amount = BigInt(amountHex).toString();

            // For now, assume it's USDC/USDT since that's what the user is looking for
            // In production, you'd look up the token by contract address
            addTransferIfUnique({
              tokenSymbol: 'USDC/USDT',
              tokenAddress: log.address || '',
              amount,
              decimals: 6, // USDC/USDT use 6 decimals
              from,
              to,
            });
            console.log(
              `Parsed ERC20 transfer: ${amount} tokens from ${from} to ${to}`,
            );
          } catch (error) {
            console.warn(`Failed to parse ERC20 transfer log:`, error);
          }
        }
      }
    }

    console.log(
      `Total unique token transfers found for ${txHash}: ${tokenTransfers.length}`,
    );

    const detailedTransaction: BlockExplorerTransaction = {
      hash: tx.hash || '',
      blockNumber,
      timestamp,
      from: fromAddress,
      to: toAddress,
      value,
      gasUsed,
      gasPrice,
      fee,
      status,
      method,
      type,
      tokenTransfers: tokenTransfers.length > 0 ? tokenTransfers : undefined,
    };

    console.log(
      `Fetched detailed transaction ${txHash} with ${tokenTransfers.length} token transfers`,
    );
    return detailedTransaction;
  } catch (error) {
    console.error(`Error fetching transaction details for ${txHash}:`, error);
    return null;
  }
}

/**
 * Format token amount based on decimals
 * Converts raw token amount to human-readable format
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number,
): string {
  try {
    const value = typeof amount === 'string' ? amount : amount.toString();
    const valueBigInt = BigInt(value);
    const divisor = BigInt(10 ** decimals);

    const wholePart = valueBigInt / divisor;
    const remainder = valueBigInt % divisor;

    // Format decimal part based on token decimals
    const decimalPart = remainder.toString().padStart(decimals, '0');

    // Trim trailing zeros from decimal part
    const trimmedDecimal = decimalPart.replace(/0+$/, '');

    if (trimmedDecimal === '') {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedDecimal}`;
  } catch {
    return '0';
  }
}
