import { usePrivy } from '@privy-io/react-auth';
import type { IWeb3UseAuthHook } from '@/lib/web3/types';

export function useAuth(): IWeb3UseAuthHook {
  const { user, authenticated, ready, login, logout } = usePrivy();
  return {
    address: user?.wallet?.address,
    authenticated,
    ready,
    login: async () => {
      return login();
    },
    logout,
  };
}
