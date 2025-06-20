import { useWallets as usePrivyWallets } from '@privy-io/react-auth';
import { ConnectedWallet } from '@/lib/web3/types';

export function useWallet(): ConnectedWallet | undefined {
  const { wallets: privyWallets } = usePrivyWallets();
  if (!privyWallets.length) {
    return undefined;
  }
  const wallet = privyWallets[0]; // Assuming first wallet
  if (!wallet) {
    return undefined;
  }
  return wallet;
}
