import { ethers } from '@/lib/web3';
import { logFactory } from '@/lib/debug';
import { readFromCeloRpc } from '@/lib/api/pledges/celo-rpc';

const logVerbose = logFactory('verbose', '⛽ TransactionFees');
const logWarn = logFactory('warn', '⛽ TransactionFees');

const MIN_PRIORITY_FEE_PER_GAS = ethers.parseUnits('2', 'gwei');
const MIN_MAX_FEE_PER_GAS = ethers.parseUnits('200', 'gwei');

interface TransactionOverridesContext {
  operation: string;
  gasLimit: bigint;
  context?: Record<string, unknown>;
}

export interface TransactionFeeOverrides {
  gasLimit: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
}

function maxBigInt(...values: bigint[]): bigint {
  return values.reduce((maxValue, value) =>
    value > maxValue ? value : maxValue,
  );
}

export async function getCeloTransactionOverrides({
  operation,
  gasLimit,
  context,
}: TransactionOverridesContext): Promise<TransactionFeeOverrides> {
  try {
    const { feeData, latestBlock } = await readFromCeloRpc(
      {
        operation: `read Celo fee data for ${operation}`,
        context,
      },
      async (readProvider) => {
        const [feeDataResult, latestBlockResult] = await Promise.all([
          readProvider.getFeeData(),
          readProvider.getBlock('latest'),
        ]);

        return {
          feeData: feeDataResult,
          latestBlock: latestBlockResult,
        };
      },
    );

    const baseFeePerGas =
      latestBlock?.baseFeePerGas ?? feeData.gasPrice ?? MIN_MAX_FEE_PER_GAS;
    const maxPriorityFeePerGas = maxBigInt(
      feeData.maxPriorityFeePerGas ?? 0n,
      MIN_PRIORITY_FEE_PER_GAS,
    );
    const maxFeePerGas = maxBigInt(
      feeData.maxFeePerGas ?? 0n,
      baseFeePerGas * 2n + maxPriorityFeePerGas,
      MIN_MAX_FEE_PER_GAS,
    );

    logVerbose('Using dynamic transaction fee overrides', {
      ...context,
      operation,
      gasLimit: gasLimit.toString(),
      baseFeePerGas: ethers.formatUnits(baseFeePerGas, 'gwei'),
      maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, 'gwei'),
      maxFeePerGas: ethers.formatUnits(maxFeePerGas, 'gwei'),
    });

    return {
      gasLimit,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  } catch (error) {
    logWarn('Falling back to conservative transaction fee overrides', {
      ...context,
      operation,
      gasLimit: gasLimit.toString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      gasLimit,
      maxPriorityFeePerGas: MIN_PRIORITY_FEE_PER_GAS,
      maxFeePerGas: MIN_MAX_FEE_PER_GAS,
    };
  }
}
