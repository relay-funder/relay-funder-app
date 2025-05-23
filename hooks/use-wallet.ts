import { useWallets } from '@privy-io/react-auth';
export function useWallet() {
  const { wallets } = useWallets();
  if (!wallets.length) {
    return null;
  }
  const wallet = wallets[0]; // Assuming first wallet
  return wallet;
}
