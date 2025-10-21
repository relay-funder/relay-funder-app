// Daimo Pay Configuration Constants
export const DAIMO_PAY_USDC_ADDRESS =
  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as const; // USDC on Optimism
export const DAIMO_PAY_CHAIN_ID = 10 as const; // Optimism
export const DAIMO_PAY_CHAIN_NAME = 'Optimism' as const;
export const DAIMO_PAY_TOKEN_SYMBOL = 'USDC' as const;
export const DAIMO_PAY_MIN_AMOUNT = 0.1 as const;

// Daimo Pay reset timing configuration
export const DAIMO_PAY_INITIAL_RESET_DELAY = 100; // ms - minimal delay since tip is pre-calculated
export const DAIMO_PAY_DEBOUNCE_DELAY = 300; // ms - debounce for subsequent updates
