'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  chainConfig,
  useAccount,
  useConnectorClient,
  useSwitchChain,
  useWeb3Auth,
  useCurrentChain,
} from '@/lib/web3';
import type { ProviderRpcError } from '@/lib/web3/types';
import { debugHook as debug } from '@/lib/debug';

export function useNetworkCheck() {
  const { address } = useAccount();
  const { chainId } = useCurrentChain();
  const { ready } = useWeb3Auth();
  const { toast } = useToast();
  const { data: client } = useConnectorClient();
  const { switchChainAsync: switchChain } = useSwitchChain();
  const [triggerCheck, setTriggerCheck] = useState(Date.now());
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const checkNetwork = useCallback(() => {
    debug && console.log('use-network::checkNetwork');
    try {
      debug &&
        console.log('use-network::checkNetwork', chainId, chainConfig.chainId);
      const correctNetwork = chainId === chainConfig.chainId;
      debug &&
        console.log(
          'use-network::checkNetwork',
          chainId === chainConfig.chainId,
          correctNetwork,
        );
      setIsCorrectNetwork(correctNetwork);
      return correctNetwork;
    } catch (error) {
      console.error('Error checking network:', error);
      setIsCorrectNetwork(false);
      return false;
    }
  }, [chainId]);
  useEffect(() => {
    checkNetwork();
  }, [checkNetwork, triggerCheck, chainId]);

  const switchNetwork = useCallback(async () => {
    debug && console.log('hooks/use-network::switchNetwork', { ready, client });
    if (!ready || !client) {
      return;
    }

    try {
      try {
        await switchChain({ chainId: chainConfig.chainId });
        setTriggerCheck(Date.now());
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (
          (typeof switchError === 'object' &&
            switchError !== null &&
            'code' in switchError &&
            (switchError as ProviderRpcError).code === 4902) ||
          switchError === 'wallet_switchEthereumChain failed. Invalid chain ID'
        ) {
          try {
            debug && console.log('trying to add chain', chainId);
            await client.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig.getAddChainParams()],
            });
            setTriggerCheck(Date.now());
          } catch (addError) {
            console.error('Error adding network:', addError);
            throw new Error('Failed to add network');
          }
        } else {
          console.error('Error switching network:', switchError);
          throw new Error('Failed to switch network');
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      toast({
        title: 'Network Switch Failed',
        description:
          'Failed to switch to ' +
          chainConfig.name +
          ' network.' +
          ' Please try switching manually in your wallet.',
        variant: 'destructive',
      });
    }
  }, [ready, toast, chainId, client, switchChain]);

  useEffect(() => {
    if (!address) {
      debug && console.log('use-network:effect: no wallet');
      return;
    }

    let cleanup: (() => void) | undefined;

    const initializeNetwork = async () => {
      try {
        if (!address) {
          debug && console.log('use-network:effect: wallet not connected');
          setIsCorrectNetwork(false);
          return;
        }

        // Initial network check
        setTriggerCheck(Date.now());
      } catch (error) {
        console.error('Error initializing network check:', error);
        setIsCorrectNetwork(false);
      }
    };

    initializeNetwork();
    return () => cleanup?.();
  }, [address, checkNetwork, client]);
  debug &&
    console.log('hooks/use-network', {
      isCorrectNetwork,
      chainId: chainConfig.chainId,
      currentChain: chainId,
    });
  return { isCorrectNetwork, switchNetwork };
}
