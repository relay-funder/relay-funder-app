import { type ReactNode } from 'react';

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  return children;
}
export function useWeb3Context() {
  return {
    chainId: 0,
    chain: {},
    address: '0x00',
    initialized: true,
    requestWallet: () => {},
  };
}
