import { useWallets as usePrivyWallets } from '@privy-io/react-auth';
import { useConnect } from 'wagmi';
import { ConnectedWallet } from '@/lib/web3/types';
import { AUTH_PROVIDER } from '@/lib/constant';
import { EthereumProvider } from '@silk-wallet/silk-wallet-sdk';
export function useWallet(): ConnectedWallet | null {
  if (AUTH_PROVIDER === 'privy') {
    const { wallets: privyWallets } = usePrivyWallets();
    if (!privyWallets.length) {
      return null;
    }
    const wallet = privyWallets[0]; // Assuming first wallet
    return wallet;
  }
  if (AUTH_PROVIDER === 'silk') {
    const { connectors } = useConnect();

    const { wallets: silkWallets } = {
      wallets: [
        {
          getEthereumProvider: async (): Promise<EthereumProvider> => {
            return (await connectors.at(0)?.getProvider()) as EthereumProvider;
          },
          isConnected: async () => {
            return false;
          },
          address: '0x....',
        },
      ],
    };
    if (!silkWallets.length) {
      return null;
    }
    const wallet = silkWallets[0]; // Assuming first wallet
    return wallet;
  }
}
