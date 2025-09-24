import { chainConfig, ethers } from '@/lib/web3';

export const getProvider = () => {
  // For browser environments
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  // Fallback to a public provider
  return new ethers.JsonRpcProvider(chainConfig.rpcUrl);
};

export const getSigner = async () => {
  const provider = getProvider();

  if (provider instanceof ethers.BrowserProvider) {
    // Request account access if needed
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  }

  throw new Error('No signer available. Please connect a wallet.');
};
