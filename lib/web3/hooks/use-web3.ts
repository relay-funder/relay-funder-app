import { useAuth } from '@/lib/web3/auth/use-auth';
import type { IWeb3UseAuthHook } from '@/lib/web3/types';

export function useWeb3(): IWeb3UseAuthHook {
  const { login, logout, authenticated, ready, address } = useAuth();

  return { login, logout, authenticated, ready, address };
}
