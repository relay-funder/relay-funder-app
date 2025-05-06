'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { adminAddress } from '@/lib/constant';

interface AuthContextType {
  address: string | null;
  authenticated: boolean;
  user: any;
  wallet: any;
  isAdmin: boolean;
  isClient: boolean;
  login: () => void;
  logout: () => Promise<void>;
  forceWalletConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  address: null,
  authenticated: false,
  user: null,
  wallet: null,
  isAdmin: false,
  isClient: false,
  login: () => {},
  logout: async () => {},
  forceWalletConnection: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address: wagmiAddress } = useAccount();
  const { user, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isClient, setIsClient] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(0);
  
  // Get the primary wallet if available
  const wallet = wallets && wallets.length > 0 ? wallets[0] : null;
  
  // Try to get address from all possible sources
  // Priority: 1. Active wallet from wallets array, 2. User data, 3. Wagmi
  const [address, setAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Set client-side flag on mount
  useEffect(() => {
    setIsClient(true);
    console.log('[AUTH] Client-side rendering active');
  }, []);

  // Force a wallet connection attempt and return true if connected
  const forceWalletConnection = async (): Promise<boolean> => {
    console.log('[AUTH] Forcing wallet connection');
    // Don't attempt more than once every 3 seconds
    const now = Date.now();
    if (now - lastConnectionAttempt < 3000) {
      console.log('[AUTH] Connection attempt too recent, skipping');
      return !!address;
    }
    
    setLastConnectionAttempt(now);
    
    if (!authenticated) {
      console.log('[AUTH] Not authenticated, trying to login');
      login();
      return false;
    }
    
    // If wallet exists, try to connect it
    if (wallet) {
      try {
        console.log('[AUTH] Attempting to connect wallet');
        const isConnected = await wallet.isConnected?.();
        if (!isConnected) {
          // Try to reestablish connection or redirect
          console.log('[AUTH] Wallet not connected, forcing login');
          login();
          return false;
        }
        return true;
      } catch (err) {
        console.error('[AUTH] Error connecting wallet:', err);
        return false;
      }
    } else {
      console.log('[AUTH] No wallet available, forcing login');
      login();
      return false;
    }
  };

  // Update address and admin status when dependencies change
  useEffect(() => {
    const getWalletAddress = async () => {
      if (!isClient) return;
      
      let resolvedAddress = null;
      
      // Try to get from wallets array first
      if (wallet && await wallet.isConnected?.()) {
        try {
          // Some wallet providers expose address directly
          if (wallet.address) {
            resolvedAddress = wallet.address;
          } 
          // Some need to get the signer first
          else {
            const provider = await wallet.getEthereumProvider();
            if (provider && provider.request) {
              const accounts = await provider.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0) {
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
        resolvedAddress = user?.wallet?.address || wagmiAddress || null;
      }
      
      // Normalize address to lowercase for consistent comparisons
      const normalizedAddress = resolvedAddress ? resolvedAddress.toLowerCase() : null;
      console.log('[AUTH] Final resolved address:', normalizedAddress);
      setAddress(normalizedAddress);
      
      // Update admin status with more detailed logging
      const normalizedAdminAddress = adminAddress ? adminAddress.toLowerCase() : null;
      console.log('[AUTH] Admin check:', {
        userAddress: normalizedAddress,
        adminAddress: normalizedAdminAddress,
        configuredAdminAddress: adminAddress,
        match: !!normalizedAddress && normalizedAddress === normalizedAdminAddress
      });
      
      const adminStatus = !!normalizedAddress && normalizedAddress === normalizedAdminAddress;
      setIsAdmin(adminStatus);
      console.log('[AUTH] Admin status set to:', adminStatus);
    };
    
    getWalletAddress();
  }, [wallet, user, wagmiAddress, wallets, isClient]);

  // Debugging logs
  useEffect(() => {
    if (isClient) {
      console.log('[AUTH DEBUG] wagmiAddress:', wagmiAddress);
      console.log('[AUTH DEBUG] user:', user);
      console.log('[AUTH DEBUG] user.wallet?.address:', user?.wallet?.address);
      console.log('[AUTH DEBUG] wallets:', wallets);
      console.log('[AUTH DEBUG] primary wallet:', wallet);
      console.log('[AUTH DEBUG] authenticated:', authenticated);
      console.log('[AUTH DEBUG] final address:', address);
      console.log('[AUTH DEBUG] isAdmin:', isAdmin);
      console.log('[AUTH DEBUG] adminAddress:', adminAddress);
    }
  }, [wagmiAddress, user, wallets, wallet, authenticated, address, isAdmin, isClient, adminAddress]);

  const value = useMemo(() => ({
    address,
    authenticated,
    user,
    wallet,
    isAdmin,
    isClient,
    login,
    logout,
    forceWalletConnection,
  }), [address, authenticated, user, wallet, isAdmin, isClient, login, logout, forceWalletConnection]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext); 