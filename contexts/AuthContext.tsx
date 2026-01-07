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

  // Preload appkit and wagmi in background after initial render
  useEffect(() => {
    Promise.all([
      import('@reown/appkit/react'),
      import('@wagmi/core'),
      import('@/lib/web3/adapter/appkit/config'),
    ]);
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
    // Dynamically import wagmi core disconnect to avoid blocking initial load
    const [{ disconnect }, { config }] = await Promise.all([
      import('@wagmi/core'),
      import('@/lib/web3/adapter/appkit/config'),
    ]);
    await disconnect(config);
    await signOut();
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
