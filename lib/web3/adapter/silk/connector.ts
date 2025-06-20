import { ChainNotConfiguredError, createConnector } from '@wagmi/core';
import { SwitchChainError, UserRejectedRequestError, getAddress } from 'viem';
export { options as connectorOptions } from './options';

import { debugWeb3AdapterSilkConnector as debug } from '@/lib/debug';

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

/**
 * Creates a WAGMI connector for the Silk Wallet SDK
 * @param options the initialization options passed to the Silk Wallet SDK
 * @returns
 */
export function connector(options?: InitSilkOptions) {
  debug && console.log('web3/adapter/silk-wagmi/connector', { options });
  return createConnector<SilkEthereumProviderInterface>((config) => {
    debug &&
      console.log('web3/adapter/silk-wagmi/connector::createConnector', {
        config,
      });
    return {
      id: 'silk',
      name: 'Silk Connector',
      type: 'Silk',
      chains: config.chains,
      supportsSimulation: false,

      async connect({ chainId, isReconnecting } = {}) {
        debug &&
          console.log('web3/adapter/silk-wagmi/connector::connect', {
            chainId,
          });
        try {
          config.emitter.emit('message', {
            type: 'connecting',
          });
          const provider = await this.getProvider();
          if (!isReconnecting && typeof provider.on === 'function') {
            provider.on('accountsChanged', this.onAccountsChanged);
            provider.on('chainChanged', this.onChainChanged);
            provider.on('disconnect', this.onDisconnect);
          }

          if (!provider.connected) {
            try {
              await provider.login();
            } catch (error) {
              debug && console.warn('Unable to login', error);
              throw new UserRejectedRequestError(
                'User rejected login or login failed' as unknown as Error,
              );
            }
          }

          let currentChainId = await this.getChainId();
          if (chainId && currentChainId !== chainId) {
            debug &&
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
          debug && console.error('Error while connecting', error);
          this.onDisconnect();
          throw error;
        }
      },

      async getAccounts() {
        debug && console.log('web3/adapter/silk-wagmi/connector::getAccounts');
        const provider = await this.getProvider();
        const accounts = await provider.request({
          method: SILK_METHOD.eth_accounts,
        });
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
        debug && console.log('web3/adapter/silk-wagmi/connector::getChainId');
        const provider = await this.getProvider();
        const chainId = await provider.request({
          method: SILK_METHOD.eth_chainId,
        });
        debug &&
          console.log('web3/adapter/silk-wagmi/connector::getChainId', chainId);
        return Number(chainId);
      },

      async getProvider(): Promise<SilkEthereumProviderInterface> {
        debug && console.log('web3/adapter/silk-wagmi/connector::getProvider');
        if (!window.silk) {
          debug &&
            console.log('Initializing Silk Provider with options:', options);
          window.silk = initSilk(options ?? {});
        }

        return window.silk;
      },

      async isAuthorized() {
        debug && console.log('web3/adapter/silk-wagmi/connector::isAuthorized');
        try {
          const accounts = await this.getAccounts();
          return !!accounts.length;
        } catch {
          return false;
        }
      },

      async switchChain({ chainId }) {
        debug &&
          console.log('web3/adapter/silk-wagmi/connector::switchChain', {
            chainId,
          });
        try {
          const chain = config.chains.find((chain) => chain.id === chainId);
          if (!chain) {
            throw new ChainNotConfiguredError();
          }

          const provider = await this.getProvider();
          debug &&
            console.log('web3/adapter/silk-wagmi/connector::switchChain', {
              chainIdHex: `0x${chain.id.toString(16)}`,
            });
          await provider.request({
            method: SILK_METHOD.wallet_switchEthereumChain,
            params: [{ chainId: `0x${chain.id.toString(16)}` }],
          });
          config.emitter.emit('change', { chainId });

          return chain;
        } catch (error: unknown) {
          debug &&
            console.error(
              'Error: Unable to switch chain',
              error,
              await this.getProvider(),
            );
          throw new SwitchChainError(error as Error);
        }
      },

      async disconnect(): Promise<void> {
        debug && console.log('web3/adapter/silk-wagmi/connector::disconnect');
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
        debug && console.log('web3/adapter/silk-wagmi/connector::requestEmail');
        const provider = await this.getProvider();
        return provider.requestEmail();
      },

      async requestSBT(type: CredentialType): Promise<unknown> {
        debug && console.log('web3/adapter/silk-wagmi/connector::requestSBT');
        const provider = await this.getProvider();
        return provider.requestSBT(type);
      },

      onAccountsChanged(accounts) {
        debug &&
          console.log('web3/adapter/silk-wagmi/connector::onAccountsChanged', {
            accounts,
          });

        if (accounts.length === 0) {
          config.emitter.emit('disconnect');
        } else {
          config.emitter.emit('change', {
            accounts: accounts.map((account) => getAddress(account)),
          });
        }
      },

      onChainChanged(chain) {
        debug &&
          console.log('web3/adapter/silk-wagmi/connector::onChainChanged', {
            chain,
          });
        const chainId = Number(chain);
        config.emitter.emit('change', { chainId });
      },

      onDisconnect(): void {
        debug && console.log('web3/adapter/silk-wagmi/connector::onDisconnect');

        config.emitter.emit('disconnect');
      },
    };
  });
}
