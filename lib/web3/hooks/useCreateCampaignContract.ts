import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts';
import { CreateProcessStates } from '@/types/campaign';

// All on-chain specifics handled server-side

export interface IOnCreateCampaignConfirmed {
  hash: string;
  status: string;
  campaignAddress?: string;
  campaignId: number;
}
export function useCreateCampaignContract({
  onConfirmed,
}: {
  onConfirmed: (arg0: IOnCreateCampaignConfirmed) => void;
}) {
  const { authenticated } = useAuth();
  const [campaignId, setCampaignId] = useState<number | undefined>();
  // Client no longer submits on-chain tx directly; server signs and returns tx hash
  const hash = undefined as unknown as string | undefined;
  const isPending = false;
  const isConfirming = false;
  const isSuccess = false;
  const receipt = undefined as unknown as
    | { status: string; logs: unknown[] }
    | undefined;

  const createCampaignContract = useCallback(
    async ({
      campaignId,
      onStateChanged,
    }: {
      campaignId: number;
      onStateChanged: (arg0: keyof typeof CreateProcessStates) => void;
    }) => {
      if (!authenticated) {
        throw new Error('wallet not connected');
      }

      // Ensure platform setup before campaign creation
      onStateChanged('validatingPlatform');
      try {
        await fetch('/api/platform/status', { cache: 'no-store' });
      } catch {}

      // Server validates parameters; initiate server-side creation
      setCampaignId(campaignId);

      onStateChanged('createOnChain');

      // Server route will submit the transaction

      // Additional validation logging
      // (addresses validated server-side)

      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const res = await fetch(`/api/campaigns/${campaignId}/create-onchain`, {
          method: 'POST',
        });
        const json = await res.json();
        if (!json?.success) {
          throw new Error(
            json?.error || 'Server failed to create on-chain campaign',
          );
        }
        const txHash: string | undefined = json.txHash;
        onStateChanged('waitForCreationConfirmation');

        // Fast path: server already awaited .wait()
        if (json.status === 1) {
          onConfirmed({
            hash: txHash || '',
            status: 'success',
            campaignAddress: '',
            campaignId,
          });
          setCampaignId(undefined);
          return;
        }
        if (json.status === 0) {
          onConfirmed({
            hash: txHash || '',
            status: 'reverted',
            campaignAddress: '',
            campaignId,
          });
          setCampaignId(undefined);
          return;
        }

        if (txHash) {
          onConfirmed({
            hash: txHash,
            status: 'pending',
            campaignAddress: '',
            campaignId,
          });
          setCampaignId(undefined);
          return;
        }

        // No tx hash returned
        onConfirmed({
          hash: '',
          status: 'failed',
          campaignAddress: '',
          campaignId,
        });
        setCampaignId(undefined);
      } catch (error) {
        console.error('Transaction submission failed:', error);
        throw error;
      }
      // -> useEffect: hash + state:success,
      // then the receipt has the address in the event-logs
    },
    [authenticated, onConfirmed],
  );

  // No client-side confirmation loop; server returns final status
  useEffect(() => {}, [
    hash,
    isSuccess,
    receipt,
    onConfirmed,
    campaignId,
    isConfirming,
  ]);

  return {
    isPending,
    isConfirming,
    isSuccess,
    createCampaignContract,
    createCampaignContractHash: hash,
  };
}
