'use client';

import { USD_TOKEN } from '@/lib/constant';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

type DonationTokens = 'USDC' | 'USDT';

interface DonationData {
  tipAmount: string;
  amount: string;
  token: DonationTokens;
}

interface DonationContextType {
  donation: DonationData;
  setDonation: (donation: Partial<DonationData>) => void;
  setTipAmount: (amount: string) => void;
  setAmount: (amount: string) => void;
  setToken: (token: DonationTokens) => void;
  resetDonation: () => void;
}

const DonationContext = createContext<DonationContextType | undefined>(
  undefined,
);

const defaultDonation: DonationData = {
  tipAmount: '0',
  amount: '0',
  token: USD_TOKEN,
};

export const DonationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [donation, setDonationState] = useState<DonationData>(defaultDonation);

  const setDonation = useCallback((newDonation: Partial<DonationData>) => {
    setDonationState((prev) => ({ ...prev, ...newDonation }));
  }, []);

  const setTipAmount = useCallback((tipAmount: string) => {
    setDonationState((prev) => ({ ...prev, tipAmount }));
  }, []);

  const setAmount = useCallback((amount: string) => {
    setDonationState((prev) => ({ ...prev, amount }));
  }, []);

  const setToken = useCallback((token: DonationTokens) => {
    setDonationState((prev) => ({ ...prev, token }));
  }, []);

  const resetDonation = useCallback(() => {
    setDonationState(defaultDonation);
  }, []);

  const value: DonationContextType = {
    donation,
    setDonation,
    setTipAmount,
    setAmount,
    setToken,
    resetDonation,
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
