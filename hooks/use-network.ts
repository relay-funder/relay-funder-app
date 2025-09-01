'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { chainConfig } from '@/lib/web3';
import { ProviderRpcError } from '@/lib/web3/types';
import {
  useWeb3Context,
  useWeb3Auth,
  useCurrentChain,
  getProvider,
} from '@/lib/web3';

export function useNetworkCheck() {
  const { address } = useWeb3Context();
  const { chainId } = useCurrentChain();
  const { ready } = useWeb3Auth();
  const { toast } = useToast();
  const [triggerCheck, setTriggerCheck] = useState(Date.now());
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const checkNetwork = useCallback(async () => {
    console.log('use-network::checkNetwork');
    const provider = getProvider();
    if (!provider) {
      return;
    }
    try {
      console.log('use-network::checkNetwork', chainId, chainConfig.chainId);
      const correctNetwork = chainId === chainConfig.chainId;
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
  }, [checkNetwork, triggerCheck]);

  const switchNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!ready || !provider) {
      return;
    }

    try {
      const chainIdHex = `0x${chainConfig.chainId?.toString(16)}`;

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
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
            console.log('trying to add chain', chainId);
            await provider.request({
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
  }, [ready, toast, chainId]);

  useEffect(() => {
    if (!address) {
      console.log('use-network:effect: no wallet');
      return;
    }

    let cleanup: (() => void) | undefined;

    const initializeNetwork = async () => {
      try {
        if (!address) {
          console.log('use-network:effect: wallet not connected');
          setIsCorrectNetwork(false);
          return;
        }
        const provider = getProvider();
        if (!provider) {
          console.log('use-network:effect: provider not available');
          setIsCorrectNetwork(false);
          return;
        }

        // Initial network check
        setTriggerCheck(Date.now());

        // Listen for network changes
        const handleChainChanged = async (newChainIdHex: string) => {
          console.log('use-network:effect: handleChainChanged', newChainIdHex);
          const isCorrect =
            newChainIdHex === `0x${chainConfig.chainId.toString(16)}`;
          setIsCorrectNetwork(isCorrect);
        };
        if (typeof provider?.on !== 'function') {
          return;
        }
        provider.on('chainChanged', handleChainChanged);
        cleanup = () =>
          provider.removeListener('chainChanged', handleChainChanged);
      } catch (error) {
        console.error('Error initializing network check:', error);
        setIsCorrectNetwork(false);
      }
    };

    initializeNetwork();
    return () => cleanup?.();
  }, [address, checkNetwork]);

  return { isCorrectNetwork, switchNetwork };
}
