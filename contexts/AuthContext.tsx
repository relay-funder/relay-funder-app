'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { debugAuth as debug } from '@/lib/debug';

import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  address?: string;
  authenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isReady: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  address: undefined,
  authenticated: false,
  isAdmin: false,
  isClient: false,
  isReady: false,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const session = useSession();
  const [isClient, setIsClient] = useState(false);

  // Preload web3 adapter modules in background after initial render
  useEffect(() => {
    import('@/lib/web3/auth')
      .then(({ preloadWeb3Modules }) => preloadWeb3Modules())
      .catch((err) => console.warn('Failed to preload web3 modules:', err));
  }, []);

  const authenticated = useMemo(() => {
    debug &&
      console.log('contexts/AuthContext: rememo authenticated', session.status);
    if (session.status === 'authenticated') {
      return true;
    }
    return false;
  }, [session?.status]);

  const isReady = useMemo(() => {
    debug &&
      console.log('contexts/AuthContext: rememo isReady', session.status);
    if (session.status === 'loading') {
      return false;
    }
    return true;
  }, [session?.status]);

  const address = useMemo(() => {
    debug &&
      console.log(
        'contexts/AuthContext: rememo address',
        session?.data?.user?.address,
      );

    if (typeof session?.data?.user?.address !== 'string') {
      return undefined;
    }
    return session.data.user.address;
  }, [session?.data?.user?.address]);
  // Set client-side flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAdmin = useMemo(() => {
    return session?.data?.user?.roles?.includes('admin') ?? false;
  }, [session?.data?.user?.roles]);
  // Debugging logs
  useEffect(() => {
    if (!isClient || !debug) {
      return;
    }
    console.log(
      '[AUTH DEBUG]',
      JSON.stringify({
        authenticated,
        address,
        isAdmin,
      }),
    );
  }, [authenticated, address, isAdmin, isClient]);
  const logout = useCallback(async () => {
    try {
      // Dynamically import disconnect to avoid blocking initial load
      const { disconnectWallet } = await import('@/lib/web3/auth');
      await disconnectWallet();
    } finally {
      // Ensure signOut is called even if disconnect fails
      await signOut();
    }
  }, []);
  const value = useMemo(() => {
    return {
      address,
      authenticated,
      isReady,
      isAdmin,
      isClient,
      login: signIn,
      logout,
    };
  }, [address, authenticated, isReady, isAdmin, isClient, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
