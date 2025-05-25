'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
// import { usePrivy } from '@privy-io/react-auth';
import { ADMIN_ADDRESS } from '@/lib/constant';
const debug = process.env.NODE_ENV !== 'production';
import { useAccount } from './AccountContext';
import { enableAdmin } from '@/lib/develop';
import { ConnectedWallet } from '@/lib/web3/types';
import { useWallet } from '@/lib/web3/hooks/use-wallet';
import { useWeb3 } from '@/lib/web3/hooks/use-web3';
interface AuthContextType {
  address: string | null;
  authenticated: boolean;
  wallet: ConnectedWallet | null;
  isAdmin: boolean;
  isClient: boolean;
  isReady: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  address: null,
  authenticated: false,
  wallet: null,
  isAdmin: false,
  isClient: false,
  isReady: false,
  login: () => {},
  logout: async () => {},
});
const normalizedAdminAddress =
  typeof ADMIN_ADDRESS === 'string' ? ADMIN_ADDRESS.toLowerCase() : null;
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address: wagmiAddress } = useAccount();
  const {
    address: web3Address,
    authenticated,
    login,
    logout,
    ready: isReady,
  } = useWeb3();

  const [isClient, setIsClient] = useState(false);

  // Get the primary wallet if available
  const wallet = useWallet();

  // Try to get address from all possible sources
  // Priority: 1. Active wallet from wallets array, 2. User data, 3. Wagmi
  const [address, setAddress] = useState<string | null>(null);

  // Set client-side flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getWalletAddress = async () => {
      if (!isClient) {
        return;
      }

      let resolvedAddress = null;

      if (wallet && (await wallet.isConnected?.())) {
        try {
          // Some wallet providers expose address directly
          if (wallet.address) {
            resolvedAddress = wallet.address;
          }
          // Some need to get the provider first
          else {
            const provider = await wallet.getEthereumProvider();
            if (provider && provider?.request) {
              const accounts = await provider.request({
                method: 'eth_accounts',
              });
              if (Array.isArray(accounts) && accounts.length > 0) {
                resolvedAddress = accounts[0];
              }
            }
          }
        } catch (err) {
          console.error('[AUTH] Error getting wallet address:', err);
        }
      }

      // Fall back to other sources if not resolved
      if (!resolvedAddress) {
        resolvedAddress = web3Address || wagmiAddress || null;
      }

      // Normalize address to lowercase for consistent comparisons
      const normalizedAddress = resolvedAddress
        ? resolvedAddress.toLowerCase()
        : null;
      debug && console.log('[AUTH] Final resolved address:', normalizedAddress);
      setAddress(normalizedAddress);
    };

    getWalletAddress();
  }, [wallet, web3Address, wagmiAddress, isClient]);
  const isAdmin = useMemo(() => {
    return enableAdmin || (!!address && address === normalizedAdminAddress);
  }, [address]);
  // Debugging logs
  useEffect(() => {
    if (!isClient || !debug) {
      return;
    }
    console.log('[AUTH DEBUG]', {
      wagmiAddress,
      web3Address,
      wallet,
      authenticated,
      address,
      isAdmin,
    });
  }, [
    wagmiAddress,
    web3Address,
    wallet,
    authenticated,
    address,
    isAdmin,
    isClient,
  ]);

  const value = useMemo(
    () => ({
      address,
      authenticated,
      isReady,
      wallet,
      isAdmin,
      isClient,
      login,
      logout,
    }),
    [address, authenticated, isReady, wallet, isAdmin, isClient, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
