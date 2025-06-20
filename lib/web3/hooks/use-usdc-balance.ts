import { useAuth } from '@/lib/web3';
import { useState, useEffect } from 'react';
import { erc20Abi } from 'viem';
import { USDC_ADDRESS } from '@/lib/constant';
import { ethers } from 'ethers';

export function useUsdcBalance() {
  const { wallet } = useAuth();
  const [usdcBalance, setUsdcBalance] = useState(0);
  useEffect(() => {
    const fetchUsdcBalance = async () => {
      console.log('fetchUSDCBalance');
      if (!wallet || !(await wallet.isConnected())) {
        return;
      }
      const walletProvider = await wallet.getEthereumProvider();
      if (!walletProvider) {
        return;
      }
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const userAddress = signer.address;
      console.log('fetchUSDCBalance', { userAddress });

      // Initialize USDC contract
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS as string,
        erc20Abi,
        signer,
      );
      console.log('fetchUSDCBalance', { usdcContract });

      // Fetch balance
      const balance = await usdcContract.balanceOf(userAddress);
      let unit: number | string = parseInt(
        process.env.NEXT_PUBLIC_USDC_DECIMALS ?? '',
      );
      if (isNaN(unit)) {
        // literal unit name provided or fallback
        unit = process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6;
      }
      console.log('fetchUSDCBalance', {
        balance,
        unit,
      });
      setUsdcBalance(parseFloat(ethers.formatUnits(balance, unit)));
    };

    fetchUsdcBalance();
  }, [wallet]);
  return usdcBalance;
}
