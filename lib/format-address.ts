import { chainConfig } from '@/lib/web3/config/chain';

export function formatAddress(address: string) {
  if (!address || address.length !== 42) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getBlockExplorerAddressUrl(address: string): string {
  if (!address || address.length !== 42) {
    return '';
  }
  const baseUrl = chainConfig.blockExplorerUrl.replace(/\/$/, ''); // Remove trailing slash
  return `${baseUrl}/address/${address}`;
}

export function getBlockExplorerTxUrl(txHash: string): string {
  if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
    console.warn('Invalid transaction hash for URL generation:', txHash);
    return '';
  }
  const baseUrl = chainConfig.blockExplorerUrl.replace(/\/$/, ''); // Remove trailing slash
  const url = `${baseUrl}/tx/${txHash}`;
  console.log('Generated block explorer URL:', url);
  return url;
}
