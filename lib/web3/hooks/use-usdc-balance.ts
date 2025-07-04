import { useAuth, erc20Abi, ethers } from '@/lib/web3';
import { useState, useEffect } from 'react';
import { USDC_ADDRESS } from '@/lib/constant';

export function useUsdcBalance() {
  const { wallet } = useAuth();
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [isPending, setIsPending] = useState(true);
  useEffect(() => {
    const fetchUsdcBalance = async () => {
      console.log('fetchUSDCBalance');
      setIsPending(true);
      if (!wallet || !(await wallet.isConnected())) {
        setUsdcBalance('unknown (not connected)');
        setIsPending(false);
        return;
      }
      const walletProvider = await wallet.getEthereumProvider();
      if (!walletProvider) {
        setUsdcBalance('unknown (no wallet provider)');
        setIsPending(false);
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
      setUsdcBalance(ethers.formatUnits(balance, unit));
      setIsPending(false);
    };

    fetchUsdcBalance();
  }, [wallet]);
  return { usdcBalance, isPending };
}
