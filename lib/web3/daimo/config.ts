import { celoUSDC, celoUSDT } from '@daimo/pay-common';
import { getAddress } from 'viem';
import { USD_TOKEN } from '@/lib/constant';
import {
  DAIMO_PAY_USDC_ADDRESS,
  DAIMO_PAY_USDT_ADDRESS,
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
 * Primary token is USDT for production, USDC supported for development/testing
 * Both tokens are on Celo to match CCP treasury contract deployment
 */
export function getDaimoPayConfig(): DaimoPayConfig {
  // Select token based on environment configuration
  const useUSDT = USD_TOKEN === 'USDT';
  const tokenConfig = useUSDT ? celoUSDT : celoUSDC;
  const tokenSymbol = useUSDT ? 'USDT' : 'USDC';

  const configuredToken = getAddress(tokenConfig.token);
  const configuredChain = tokenConfig.chainId;

  // Validate token address against expected values (USDT primary, USDC fallback)
  const isTokenValid =
    (useUSDT &&
      configuredToken.toLowerCase() === DAIMO_PAY_USDT_ADDRESS.toLowerCase()) ||
    (!useUSDT &&
      configuredToken.toLowerCase() === DAIMO_PAY_USDC_ADDRESS.toLowerCase());
  const isChainValid = configuredChain === DAIMO_PAY_CHAIN_ID;

  // Generate warning if using USDC instead of USDT (since USDT is now primary)
  let tokenMismatchWarning: string | undefined;
  if (!useUSDT) {
    tokenMismatchWarning = `Using USDC on Celo instead of USDT. Consider switching to USDT for production (${DAIMO_PAY_USDT_ADDRESS}).`;
  }

  if (!isTokenValid) {
    const expectedAddress = useUSDT
      ? DAIMO_PAY_USDT_ADDRESS
      : DAIMO_PAY_USDC_ADDRESS;
    console.error('Daimo Pay token configuration mismatch:', {
      configured: configuredToken,
      expected: expectedAddress,
      token: useUSDT ? 'USDT' : 'USDC',
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
    chainName: DAIMO_PAY_CHAIN_NAME, // Celo mainnet
    tokenAddress: configuredToken,
    tokenSymbol,
    isValid: isTokenValid && isChainValid,
    tokenMismatchWarning,
  };
}
