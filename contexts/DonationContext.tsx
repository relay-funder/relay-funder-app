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
  const [amount, setAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [token, setToken] = useState<DonationTokens>(USD_TOKEN);
  const [paymentType, setPaymentType] = useState<PaymentTabValue>(defaultTab);
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const clearDonation = useCallback(() => {
    setAmount('0');
    setTipAmount('0');
    setToken(USD_TOKEN);
    setIsProcessingPayment(false);
    setIsPaymentCompleted(false);
  }, []);

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
