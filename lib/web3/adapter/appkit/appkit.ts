import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { useCallback, useMemo } from 'react';
import { IWeb3UseConnectedAccountHook } from '../../types';

export function useConnectedAccount(): IWeb3UseConnectedAccountHook {
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();
  const { open } = useAppKit();
  const isEmbedded = useMemo(() => {
    if (typeof embeddedWalletInfo?.authProvider === 'undefined') {
      return false;
    }
    return true;
  }, [embeddedWalletInfo?.authProvider]);
  const embeddedEmail = useMemo(() => {
    return embeddedWalletInfo?.user?.email;
  }, [embeddedWalletInfo?.user?.email]);
  const openUi = useCallback(() => {
    open();
  }, [open]);
  return { address, isEmbedded, embeddedEmail, isConnected, openUi };
}
