import { chainConfig } from '@/lib/web3';
import { debugWeb3 as debug } from '@/lib/debug';
import type { Chain, Client, Transport } from 'viem';

export async function switchNetwork({
  client,
}: {
  client: Client<Transport, Chain>;
}) {
  if (!client) {
    throw new Error('Wallet not connected');
  }
  try {
    debug && console.log(`Switching to  ${chainConfig.name} network...`);
    const chainIdHex = `0x${chainConfig.chainId.toString(16)}`;
    await client.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    debug &&
      console.log(`Successfully switched to  ${chainConfig.name} network`);
  } catch (switchError: unknown) {
    debug && console.error('Network switch error:', switchError);
    if (
      switchError instanceof Error &&
      'code' in switchError &&
      switchError.code === 4902
    ) {
      try {
        debug &&
          console.log(`Attempting to add ${chainConfig.name} network...`);
        await client.request({
          method: 'wallet_addEthereumChain',
          params: [chainConfig.getAddChainParams()],
        });
        debug && console.log(`Successfully added  ${chainConfig.name} network`);
      } catch (addError) {
        debug && console.error('Error adding network:', addError);
        throw new Error('Failed to add network');
      }
    }
    throw switchError;
  }
}
