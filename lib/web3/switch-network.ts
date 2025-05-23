import { chainConfig } from '@/config/chain';
import { ConnectedWallet } from '@privy-io/react-auth';

const debug = process.env.NODE_ENV !== 'production';

export async function switchNetwork({ wallet }: { wallet: ConnectedWallet }) {
  if (!wallet || !wallet.isConnected()) {
    throw new Error('Wallet not connected');
  }
  const privyProvider = await wallet.getEthereumProvider();
  try {
    debug && console.log('Switching to Alfajores network...');
    await privyProvider.request({
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
        await privyProvider.request({
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
