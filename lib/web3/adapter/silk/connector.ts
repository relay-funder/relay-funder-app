import { ChainNotConfiguredError, createConnector } from '@wagmi/core';
import { SwitchChainError, UserRejectedRequestError, getAddress } from 'viem';

import {
  type CredentialType,
  SILK_METHOD,
} from '@silk-wallet/silk-interface-core';
import { initSilk } from '@silk-wallet/silk-wallet-sdk';
import type {
  InitSilkOptions,
  SilkEthereumProviderInterface,
} from '@silk-wallet/silk-wallet-sdk';

// the ProviderInterface in silk 0.6.0 is incomplete:
interface SilkEthereumExtendedProviderInterface
  extends SilkEthereumProviderInterface {
  uiMessageManager: {
    removeListener: (
      event: string,
      callback:
        | ((accounts: string[]) => void)
        | ((chainId: string) => void)
        | (() => void),
    ) => void;
  };
}
// For reference: WAGMI connector event map: wagmi/packages/core/src/connectors/createConnector.ts
// type ConnectorEventMap = {
//   change: {
//     accounts?: readonly Address[] | undefined
//     chainId?: number | undefined
//   }
//   connect: { accounts: readonly Address[]; chainId: number }
//   disconnect: never
//   error: { error: Error }
//   message: { type: string; data?: unknown | undefined }
// }

/**
 * Creates a WAGMI connector for the Silk Wallet SDK
 * @param options the initialization options passed to the Silk Wallet SDK
 * @returns
 */
export function silk(options?: InitSilkOptions) {
  let silkProvider: SilkEthereumProviderInterface | null = null;

  return createConnector<SilkEthereumProviderInterface>((config) => {
    return {
      id: 'silk',
      name: 'Silk Connector',
      type: 'Silk',
      chains: config.chains,
      supportsSimulation: false,

      async connect({ chainId } = {}) {
        try {
          config.emitter.emit('message', {
            type: 'connecting',
          });
          const provider = await this.getProvider();

          provider.on('accountsChanged', this.onAccountsChanged);
          provider.on('chainChanged', this.onChainChanged);
          provider.on('disconnect', this.onDisconnect);

          if (!provider.connected) {
            try {
              await provider.login(window.ethereum);
            } catch (error) {
              console.warn('Unable to login', error);
              throw new UserRejectedRequestError(
                'User rejected login or login failed' as unknown as Error,
              );
            }
          }

          let currentChainId = await this.getChainId();
          if (chainId && currentChainId !== chainId) {
            console.info(
              `Switching chain from ${currentChainId} to ${chainId}`,
            );
            const chain = await this.switchChain!({ chainId }).catch(
              (error) => {
                if (error.code === UserRejectedRequestError.code) throw error;
                return { id: currentChainId };
              },
            );
            currentChainId = chain?.id ?? currentChainId;
          }

          const accounts = await this.getAccounts();

          return { accounts, chainId: currentChainId };
        } catch (error) {
          console.error('Error while connecting', error);
          this.onDisconnect();
          throw error;
        }
      },

      async getAccounts() {
        const provider = await this.getProvider();
        const accounts = await provider.request({
          method: SILK_METHOD.eth_accounts,
        });
        console.log({ accounts, k: Object.keys(SILK_METHOD) });
        if (accounts && Array.isArray(accounts)) {
          return accounts
            .filter(
              (account: string) =>
                typeof account === 'string' && account.length,
            )
            .map((account: string) => getAddress(account));
        }

        return [];
      },

      async getChainId() {
        const provider = await this.getProvider();
        const chainId = await provider.request({
          method: SILK_METHOD.eth_chainId,
        });
        return Number(chainId);
      },

      async getProvider(): Promise<SilkEthereumProviderInterface> {
        if (!silkProvider) {
          console.log('Initializing Silk Provider with options:', options);
          silkProvider = initSilk(options ?? {});
        }

        return silkProvider;
      },

      async isAuthorized() {
        try {
          const accounts = await this.getAccounts();
          return !!accounts.length;
        } catch {
          return false;
        }
      },

      async switchChain({ chainId }) {
        console.info('Switching chain to ID', chainId);
        try {
          const chain = config.chains.find((chain) => chain.id === chainId);
          if (!chain) {
            throw new ChainNotConfiguredError();
          }

          const provider = await this.getProvider();
          await provider.request({
            method: SILK_METHOD.wallet_switchEthereumChain,
            params: [{ chainId: `0x${chain.id.toString(16)}` }],
          });
          config.emitter.emit('change', { chainId });
          return chain;
        } catch (error: unknown) {
          console.error('Error: Unable to switch chain', error);
          throw new SwitchChainError(error as Error);
        }
      },

      async disconnect(): Promise<void> {
        const provider =
          (await this.getProvider()) as SilkEthereumExtendedProviderInterface;
        if ('uiMessageManager' in provider) {
          const messageManager = provider.uiMessageManager;
          messageManager.removeListener(
            'accountsChanged',
            this.onAccountsChanged,
          );
          messageManager.removeListener('chainChanged', this.onChainChanged);
          messageManager.removeListener('disconnect', this.onDisconnect);
        }
      },

      async requestEmail(): Promise<unknown> {
        const provider = await this.getProvider();
        return provider.requestEmail();
      },

      async requestSBT(type: CredentialType): Promise<unknown> {
        const provider = await this.getProvider();
        return provider.requestSBT(type);
      },

      onAccountsChanged(accounts) {
        if (accounts.length === 0) config.emitter.emit('disconnect');
        else
          config.emitter.emit('change', {
            accounts: accounts.map((account) => getAddress(account)),
          });
      },

      onChainChanged(chain) {
        const chainId = Number(chain);
        config.emitter.emit('change', { chainId });
      },

      onDisconnect(): void {
        config.emitter.emit('disconnect');
      },
    };
  });
}
