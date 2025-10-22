// Daimo Pay Configuration Constants
// Using Celo as destination network to match CCP treasury contracts
export const DAIMO_PAY_USDC_ADDRESS =
  '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' as const; // USDC on Celo
export const DAIMO_PAY_USDT_ADDRESS =
  '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as const; // USDT on Celo
export const DAIMO_PAY_CHAIN_ID = 42220 as const; // Celo Mainnet
export const DAIMO_PAY_CHAIN_NAME = 'Celo' as const;
export const DAIMO_PAY_TOKEN_SYMBOL = 'USDT' as const; // Updated to USDT as primary
export const DAIMO_PAY_MIN_AMOUNT = 0.1 as const;

// Daimo Pay reset timing configuration
export const DAIMO_PAY_INITIAL_RESET_DELAY = 100; // ms - minimal delay since tip is pre-calculated
export const DAIMO_PAY_DEBOUNCE_DELAY = 300; // ms - debounce for subsequent updates
