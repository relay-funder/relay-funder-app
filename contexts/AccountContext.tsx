"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAccount as useWagmiAccount } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { adminAddress } from "@/lib/constant";
const debug = process.env.NODE_ENV !== "production";

enum AccountStatusEnum {
  connected = "connected",
  connecting = "connecting",
  reconnecting = "reconnecting",
  disconnected = "disconnected",
}
interface AccountContextType {
  address: string | null;
  chain: string | null;
  chainId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  status: AccountStatusEnum;
}

const AccountContext = createContext<AccountContextType>();

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    address,
    chain,
    chainId,
    isConnected,
    isConnecting,
    isReconnecting,
    status,
  } = useWagmiAccount();

  const value = useMemo(
    () => ({
      address: address?.toLowerCase(),
      chain,
      chainId,
      isConnected,
      isConnecting,
      isReconnecting,
      status,
    }),
    [
      address,
      chain,
      chainId,
      isConnected,
      isConnecting,
      isReconnecting,
      status,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
