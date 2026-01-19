import { useCallback, useState } from 'react';
import {
  chainConfig,
  ethers,
  useConnectorClient,
  useCurrentChain,
} from '@/lib/web3';
import { useAuth } from '@/contexts';
import { switchNetwork } from '@/lib/web3/switch-network';
import { requestTransaction } from '@/lib/web3/request-transaction';
import {
  useCreatePayment,
  useUpdatePaymentStatus,
} from '@/lib/hooks/usePayments';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { type DbCampaign, DonationProcessStates } from '@/types/campaign';
import { debugHook as debug } from '@/lib/debug';
import { trackEvent } from '@/lib/analytics';

export function useDonationCallback({
  campaign,
  amount,
  tipAmount = '0',
  poolAmount,
  selectedToken,
  isAnonymous = false,
  userEmail,
  onStateChanged,
}: {
  campaign: DbCampaign;
  amount: string;
  tipAmount?: string;
  poolAmount: number;
  selectedToken: string;
  isAnonymous?: boolean;
  userEmail?: string;
  onStateChanged: (state: keyof typeof DonationProcessStates) => void;
}) {
  const { data: client } = useConnectorClient();
  const { authenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { chainId } = useCurrentChain();

  const { mutateAsync: createPayment } = useCreatePayment();
  const { mutateAsync: updatePaymentStatus } = useUpdatePaymentStatus();
  const { refetch: validateUserProfile } = useUserProfile();

  const onDonate = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      onStateChanged('connect');
      debug && console.log('Starting donation process...');
      if (!authenticated) {
        throw new Error('Not signed in');
      }
      if (!client) {
        throw new Error('Wallet not connected');
      }

      // Validate user session BEFORE any blockchain transactions
      debug && console.log('Validating user session...');
      try {
        const validationResult = await validateUserProfile();
        if (validationResult.error) {
          throw validationResult.error;
        }
        debug &&
          console.log('User session validated successfully:', {
            user: validationResult.data,
          });
      } catch (validationError) {
        debug && console.error('Session validation failed:', validationError);
        throw new Error(
          validationError instanceof Error
            ? validationError.message
            : 'Session validation failed',
        );
      }

      const ethersProvider = new ethers.BrowserProvider(client);
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
      if (chainId !== chainConfig.chainId) {
        await switchNetwork({ client });
      }

      onStateChanged('requestTransaction');
      const tx = await requestTransaction({
        address: campaign.treasuryAddress,
        amount,
        tipAmount,
        client,
        onStateChanged,
      });

      // Only create payment record after transaction is sent
      debug && console.log('Creating payment record...');
      const { paymentId } = await createPayment({
        amount: amount,
        tipAmount: tipAmount,
        poolAmount,
        token: selectedToken,
        campaignId: campaign.id,
        isAnonymous: isAnonymous,
        status: 'confirming',
        transactionHash: tx.hash,
        ...(userEmail && { userEmail }),
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

      if (receipt.status === 1) {
        trackEvent('funnel_payment_success', {
          amount: parseFloat(amount),
          currency: 'USDC',
          payment_method: 'wallet',
        });
      } else {
        trackEvent('funnel_payment_failed', {
          amount: parseFloat(amount),
          currency: 'USDC',
          payment_method: 'wallet',
          error_message: 'Transaction failed on-chain',
        });
      }
      onStateChanged('done');

      debug && console.log('Payment status updated');
    } catch (err) {
      debug && console.error('Donation error:', err);
      onStateChanged('failed');

      // Parse error for user-friendly message
      let userMessage = 'Failed to process wallet payment';
      if (err instanceof Error) {
        const errMsg = err.message.toLowerCase();
        if (
          errMsg.includes('exceeds balance') ||
          errMsg.includes('insufficient')
        ) {
          userMessage =
            err.message.includes('Insufficient USDC')
              ? err.message // Use our pre-flight check message
              : 'Insufficient USDC balance. Please ensure you have enough funds including the 1% protocol fee.';
        } else if (errMsg.includes('user rejected') || errMsg.includes('denied')) {
          userMessage = 'Transaction was rejected in your wallet.';
        } else if (errMsg.includes('nonce')) {
          userMessage = 'Transaction conflict. Please wait a moment and try again.';
        } else {
          userMessage = err.message;
        }
      }

      setError(userMessage);
      trackEvent('funnel_payment_failed', {
        amount: parseFloat(amount),
        currency: 'USDC',
        payment_method: 'wallet',
        error_message: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    onStateChanged,
    authenticated,
    client,
    campaign.treasuryAddress,
    campaign.id,
    amount,
    tipAmount,
    createPayment,
    poolAmount,
    selectedToken,
    isAnonymous,
    userEmail,
    updatePaymentStatus,
    validateUserProfile,
    chainId,
  ]);
  return { onDonate, isProcessing, error };
}
