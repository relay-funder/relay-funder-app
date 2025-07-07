import { chainConfig } from '@/lib/web3/config/chain';
import { ConnectedWallet } from '@/lib/web3/types';

const debug = process.env.NODE_ENV !== 'production';

export async function switchNetwork({ wallet }: { wallet: ConnectedWallet }) {
  if (!wallet || !(await wallet.isConnected())) {
    throw new Error('Wallet not connected');
  }
  const walletProvider = await wallet.getEthereumProvider();
  if (!walletProvider) {
    throw new Error('Wallet not supported or connected');
  }
  try {
    debug && console.log('Switching to Alfajores network...');
    await walletProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainConfig.chainId.hex }],
    });
    debug && console.log('Successfully switched to Alfajores network');
  } catch (switchError: unknown) {
    debug && console.error('Network switch error:', switchError);
    if (
      switchError instanceof Error &&
      'code' in switchError &&
      switchError.code === 4902
    ) {
      try {
        debug && console.log('Attempting to add Alfajores network...');
        await walletProvider.request({
          method: 'wallet_addEthereumChain',
          params: [chainConfig.getAddChainParams()],
        });
        debug && console.log('Successfully added Alfajores network');
      } catch (addError) {
        debug && console.error('Error adding network:', addError);
        throw new Error('Failed to add network');
      }
    }
    throw switchError;
  }
}
