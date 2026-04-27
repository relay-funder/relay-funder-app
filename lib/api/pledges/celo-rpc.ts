import { ApiUpstreamError } from '@/lib/api/error';
import { CELO_RPC_ENDPOINTS } from '@/lib/constant/rpc-endpoints';
import { NEXT_PUBLIC_RPC_URL } from '@/lib/constant/server';
import { logFactory } from '@/lib/debug';
import { ethers } from '@/lib/web3';
import { waitWithTimeout } from '@/lib/web3/transaction-timeout';

const CELO_CHAIN_ID = 42220;
const DEFAULT_RPC_READ_TIMEOUT_MS = 10_000;

const logVerbose = logFactory('verbose', 'CeloRpc');
const logWarn = logFactory('warn', 'CeloRpc');

interface CeloRpcReadOptions {
  operation: string;
  timeoutMs?: number;
  context?: Record<string, unknown>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function describeRpcUrl(rpcUrl: string): string {
  try {
    const url = new URL(rpcUrl);
    return url.hostname;
  } catch {
    return 'configured-rpc';
  }
}

export function getCeloRpcUrls(): string[] {
  return Array.from(
    new Set(
      [
        NEXT_PUBLIC_RPC_URL,
        CELO_RPC_ENDPOINTS.primary,
        ...CELO_RPC_ENDPOINTS.fallbacks,
      ]
        .map((rpcUrl) => rpcUrl?.trim())
        .filter((rpcUrl): rpcUrl is string => Boolean(rpcUrl)),
    ),
  );
}

export function getPrimaryCeloRpcUrl(): string {
  const [primaryRpcUrl] = getCeloRpcUrls();

  if (!primaryRpcUrl) {
    throw new ApiUpstreamError('No Celo RPC endpoint is configured');
  }

  return primaryRpcUrl;
}

export function createCeloRpcProvider(
  rpcUrl: string = getPrimaryCeloRpcUrl(),
): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl, CELO_CHAIN_ID);
}

export async function readFromCeloRpc<T>(
  { operation, timeoutMs, context }: CeloRpcReadOptions,
  read: (provider: ethers.JsonRpcProvider) => Promise<T>,
): Promise<T> {
  const rpcUrls = getCeloRpcUrls();
  const attemptTimeoutMs = timeoutMs ?? DEFAULT_RPC_READ_TIMEOUT_MS;
  let lastError: unknown;

  if (rpcUrls.length === 0) {
    throw new ApiUpstreamError('No Celo RPC endpoint is configured');
  }

  for (let index = 0; index < rpcUrls.length; index++) {
    const rpcUrl = rpcUrls[index];
    const provider = createCeloRpcProvider(rpcUrl);
    const rpcContext = {
      ...context,
      rpcEndpoint: describeRpcUrl(rpcUrl),
      rpcAttempt: index + 1,
      rpcAttemptCount: rpcUrls.length,
    };

    try {
      const result = await waitWithTimeout(
        read(provider),
        attemptTimeoutMs,
        operation,
        rpcContext,
      );

      if (index > 0) {
        logVerbose('Celo RPC read succeeded using fallback endpoint', {
          ...rpcContext,
          operation,
        });
      }

      provider.destroy();
      return result;
    } catch (error) {
      lastError = error;
      logWarn('Celo RPC read attempt failed', {
        ...rpcContext,
        operation,
        error: getErrorMessage(error),
      });
      provider.destroy();
    }
  }

  throw new ApiUpstreamError(
    `${operation} failed across ${rpcUrls.length} Celo RPC endpoint(s): ${getErrorMessage(lastError)}`,
  );
}

export function coerceRpcBigInt(value: unknown, label: string): bigint {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return BigInt(value);
  }

  throw new ApiUpstreamError(
    `Unexpected ${label} response type from Celo RPC: ${typeof value}`,
  );
}

export function coerceRpcBoolean(value: unknown, label: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  throw new ApiUpstreamError(
    `Unexpected ${label} response type from Celo RPC: ${typeof value}`,
  );
}
