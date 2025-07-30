import { useCallback, useState } from 'react';
import { useWeb3Auth, ethers } from '@/lib/web3';
import { useAuth } from '@/contexts';
import { switchNetwork } from '@/lib/web3/switch-network';
import { requestTransaction } from '@/lib/web3/request-transaction';
import {
  useCreatePayment,
  useUpdatePaymentStatus,
} from '@/lib/hooks/usePayments';
import { type Campaign, DonationProcessStates } from '@/types/campaign';
const debug = process.env.NODE_ENV !== 'production';

export function useDonationCallback({
  campaign,
  amount,
  poolAmount,
  selectedToken,
  isAnonymous = false,
  onStateChanged,
}: {
  campaign: Campaign;
  amount: string;
  poolAmount: number;
  selectedToken: string;
  isAnonymous?: boolean;
  onStateChanged: (state: keyof typeof DonationProcessStates) => void;
}) {
  const { wallet } = useWeb3Auth();
  const { authenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutateAsync: createPayment } = useCreatePayment();
  const { mutateAsync: updatePaymentStatus } = useUpdatePaymentStatus();

  const onDonate = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      onStateChanged('connect');
      debug && console.log('Starting donation process...');
      if (!authenticated) {
        throw new Error('Not signed in');
      }
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      debug && console.log('Getting wallet provider and signer...');
      const walletProvider = await wallet.getEthereumProvider();
      if (!walletProvider) {
        throw new Error('Wallet not supported or connected');
      }
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const userAddress = signer.address;
      if (!userAddress || !ethers.isAddress(userAddress)) {
        throw new Error('User address is missing or invalid');
      }
      if (!campaign.treasuryAddress) {
        throw new Error('Campaign treasuryAddress is missing or invalid');
      }
      debug && console.log('User address:', userAddress);

      onStateChanged('switch');
      await switchNetwork({ wallet });

      onStateChanged('requestTransaction');
      const tx = await requestTransaction({
        address: campaign.treasuryAddress,
        amount,
        wallet,
        onStateChanged,
      });

      // Only create payment record after transaction is sent
      debug && console.log('Creating payment record...');
      const { paymentId } = await createPayment({
        amount: amount,
        poolAmount,
        token: selectedToken,
        campaignId: campaign.id,
        isAnonymous: isAnonymous,
        status: 'confirming',
        transactionHash: tx.hash,
      });

      debug && console.log('Payment record created with ID:', paymentId);

      debug && console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      debug && console.log('Transaction confirmed:', receipt);

      onStateChanged('storageComplete');
      // Update payment status based on receipt
      debug && console.log('Updating payment status...');
      await updatePaymentStatus({
        paymentId,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
      });
      onStateChanged('done');

      debug && console.log('Payment status updated');
    } catch (err) {
      debug && console.error('Donation error:', err);
      onStateChanged('failed');
      setError(
        err instanceof Error ? err.message : 'Failed to process wallet payment',
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    wallet,
    authenticated,
    createPayment,
    updatePaymentStatus,
    amount,
    poolAmount,
    campaign?.id,
    campaign?.treasuryAddress,
    selectedToken,
    isAnonymous,
    onStateChanged,
  ]);
  return { onDonate, isProcessing, error };
}
