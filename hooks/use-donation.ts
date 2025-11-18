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
        ...(userEmail?.trim() && { userEmail: userEmail.trim() }),
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
