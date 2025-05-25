import { useAuth as useSilkAuth } from './silk/use-auth';
import { useAuth as usePrivyAuth } from './privy/use-auth';
import { AUTH_PROVIDER } from '@/lib/constant';
import type { IWeb3UseAuthHook } from '@/lib/web3/types';

export function useAuth(): IWeb3UseAuthHook {
  if (AUTH_PROVIDER === 'privy') {
    return usePrivyAuth();
  }
  return useSilkAuth();
}
