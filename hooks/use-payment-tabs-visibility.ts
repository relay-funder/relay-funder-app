import { getFeatureFlagString } from '@/lib/flags';

export type PaymentMethodOption = 'daimo-only' | 'crypto-only' | 'both';

export interface PaymentTabsVisibility {
  showDaimoPay: boolean;
  showCryptoWallet: boolean;
  defaultTab: 'daimo' | 'wallet';
}

/**
 * Hook for determining which payment tabs should be visible
 * Returns the visibility configuration for Daimo Pay and Crypto Wallet tabs
 *
 * Controlled by NEXT_PUBLIC_PAYMENT_METHODS environment variable:
 * - 'daimo-only': Show only Daimo Pay
 * - 'crypto-only': Show only Crypto Wallet
 * - 'both' (default): Show both options with tabs
 */
export function usePaymentTabsVisibility(): PaymentTabsVisibility {
  const paymentMethod = getFeatureFlagString(
    'PAYMENT_METHODS',
  ) as PaymentMethodOption;

  switch (paymentMethod) {
    case 'daimo-only':
      return {
        showDaimoPay: true,
        showCryptoWallet: false,
        defaultTab: 'daimo',
      };
    case 'crypto-only':
      return {
        showDaimoPay: false,
        showCryptoWallet: true,
        defaultTab: 'wallet',
      };
    case 'both':
    default:
      return {
        showDaimoPay: true,
        showCryptoWallet: true,
        defaultTab: 'daimo',
      };
  }
}
