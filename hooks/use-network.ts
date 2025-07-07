'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { chainConfig } from '@/lib/web3/config/chain';
import { ProviderRpcError } from '@/lib/web3/types';
import {
  useWeb3Context,
  useAuth,
  useCurrentChain,
  getProvider,
} from '@/lib/web3';

export function useNetworkCheck() {
  const { address } = useWeb3Context();
  const { chainId } = useCurrentChain();
  const { ready } = useAuth();
  const { toast } = useToast();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const checkNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    try {
      const correctNetwork = chainId === chainConfig.chainId.decimal;
      setIsCorrectNetwork(correctNetwork);
      return correctNetwork;
    } catch (error) {
      console.error('Error checking network:', error);
      setIsCorrectNetwork(false);
      return false;
    }
  }, [chainId]);

  const switchNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!ready || !provider) {
      return;
    }

    try {
      const chainIdHex = chainConfig.chainId.hex;

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        await checkNetwork();
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
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig.getAddChainParams()],
            });
            // Check network again after adding
            await checkNetwork();
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
  }, [ready, toast, checkNetwork]);

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
        await checkNetwork();

        // Listen for network changes
        const handleChainChanged = async (newChainIdHex: string) => {
          console.log('use-network:effect: handleChainChanged', newChainIdHex);
          const isCorrect = newChainIdHex === chainConfig.chainId.hex;
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
