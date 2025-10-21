import { optimismUSDC, optimismUSDT } from '@daimo/pay-common';
import { getAddress } from 'viem';
import { USD_TOKEN } from '@/lib/constant';
import {
  DAIMO_PAY_USDC_ADDRESS,
  DAIMO_PAY_CHAIN_ID,
  DAIMO_PAY_CHAIN_NAME,
} from '@/lib/constant/daimo';

/**
 * Daimo Pay configuration with token selection based on USD_TOKEN
 * Note: Daimo Pay only works on mainnet, so this is a single configuration
 */
export interface DaimoPayConfig {
  chainId: number;
  chainName: string;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  isValid: boolean;
  tokenMismatchWarning?: string;
}

/**
 * Get Daimo Pay configuration - uses USDT if USD_TOKEN=USDT, otherwise USDC
 * Both tokens are on Optimism mainnet since Daimo Pay only works on mainnet
 */
export function getDaimoPayConfig(): DaimoPayConfig {
  // Select token based on environment configuration
  const useUSDT = USD_TOKEN === 'USDT';
  const tokenConfig = useUSDT ? optimismUSDT : optimismUSDC;
  const tokenSymbol = useUSDT ? 'USDT' : 'USDC';

  const configuredToken = getAddress(tokenConfig.token);
  const configuredChain = tokenConfig.chainId;

  // Validate against original hardcoded values (for USDC only)
  const isTokenValid =
    useUSDT ||
    configuredToken.toLowerCase() === DAIMO_PAY_USDC_ADDRESS.toLowerCase();
  const isChainValid = configuredChain === DAIMO_PAY_CHAIN_ID;

  // Generate warning if using USDT instead of original USDC configuration
  let tokenMismatchWarning: string | undefined;
  if (useUSDT) {
    tokenMismatchWarning = `Using USDT on Optimism instead of USDC. Ensure your CCP contracts expect USDT (${configuredToken}).`;
  }

  if (!isTokenValid) {
    console.error('Daimo Pay token configuration mismatch:', {
      configured: configuredToken,
      expected: DAIMO_PAY_USDC_ADDRESS,
    });
  }

  if (!isChainValid) {
    console.error('Daimo Pay chain configuration mismatch:', {
      configured: configuredChain,
      expected: DAIMO_PAY_CHAIN_ID,
    });
  }

  return {
    chainId: configuredChain,
    chainName: DAIMO_PAY_CHAIN_NAME, // Always Optimism
    tokenAddress: configuredToken,
    tokenSymbol,
    isValid: isTokenValid && isChainValid,
    tokenMismatchWarning,
  };
}
