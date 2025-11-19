'use client';

import {
  PaymentTabValue,
  usePaymentTabsVisibility,
} from '@/hooks/use-payment-tabs-visibility';
import { USD_TOKEN } from '@/lib/constant';
import {
  useCeloBalance,
  CeloFormattedBalance,
} from '@/lib/web3/hooks/use-token-balance';
import {
  useUsdBalance,
  UsdFormattedBalance,
} from '@/lib/web3/hooks/use-usd-balance';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

type DonationTokens = 'USDC' | 'USDT';

interface DonationContextType {
  amount: string;
  setAmount: (amount: string) => void;
  celoFormattedBalance: CeloFormattedBalance;
  email: string;
  setEmail: (email: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (isAnonymous: boolean) => void;
  isProcessingPayment: boolean;
  setIsProcessingPayment: (isProcessingPayment: boolean) => void;
  isPaymentCompleted: boolean;
  setIsPaymentCompleted: (isPaymentCompleted: boolean) => void;
  showDaimoPay: boolean;
  showCryptoWallet: boolean;
  paymentType: PaymentTabValue;
  setPaymentType: (paymentType: PaymentTabValue) => void;
  tipAmount: string;
  setTipAmount: (tipAmount: string) => void;
  token: DonationTokens;
  setToken: (token: DonationTokens) => void;
  usdFormattedBalance: UsdFormattedBalance;
  clearDonation: () => void;
}

const DonationContext = createContext<DonationContextType | undefined>(
  undefined,
);

export const DonationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { showDaimoPay, showCryptoWallet, defaultTab } =
    usePaymentTabsVisibility();
  const [amount, setAmountIntern] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [token, setToken] = useState<DonationTokens>(USD_TOKEN);
  const [paymentType, setPaymentType] = useState<PaymentTabValue>(defaultTab);
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const setAmount = useCallback(
    (input: string) => {
      // allow empty input (form checks apply)
      if (input.trim() != '') {
        // avoid any invalid positive numbers
        const value = parseFloat(input);
        if (isNaN(value) || value < 0) {
          return;
        }

        // Reject values that would display in exponential notation
        if (input.includes('e') || input.includes('E')) {
          return;
        }

        // Reject values that are unreasonably large for donations
        if (value > 1000000) { // Max $1,000,000 for donations
          return;
        }

        // For donations, reject values with more than 2 decimal places
        const decimalParts = input.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          return;
        }

        // Check if amount exceeds user's balance (if balance is available)
        if (usdFormattedBalance.usdBalanceAmount > 0 && value > usdFormattedBalance.usdBalanceAmount) {
          return;
        }
      }
      setAmountIntern(input);
    },
    [setAmountIntern, usdFormattedBalance.usdBalanceAmount],
  );
  const clearDonation = useCallback(() => {
    setAmount('0');
    setTipAmount('0');
    setToken(USD_TOKEN);
    setIsProcessingPayment(false);
    setIsPaymentCompleted(false);
  }, [setAmount]);

  const usdFormattedBalance = useUsdBalance({
    enabled: showCryptoWallet,
  });
  // Get native CELO balance for gas fees
  const celoFormattedBalance = useCeloBalance({
    enabled: showCryptoWallet,
  });

  const value: DonationContextType = {
    amount,
    setAmount,
    celoFormattedBalance,
    email,
    setEmail,
    isAnonymous,
    setIsAnonymous,
    isPaymentCompleted,
    setIsPaymentCompleted,
    isProcessingPayment,
    setIsProcessingPayment,
    paymentType,
    setPaymentType,
    tipAmount,
    setTipAmount,
    token,
    setToken,
    usdFormattedBalance,
    showDaimoPay,
    showCryptoWallet,
    clearDonation,
  };

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  );
};

export const useDonationContext = (): DonationContextType => {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error(
      'useDonationContext must be used within a DonationProvider',
    );
  }
  return context;
};
