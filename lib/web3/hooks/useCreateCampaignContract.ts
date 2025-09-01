import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts';
import { CreateProcessStates } from '@/types/campaign';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  parseEther,
  keccak256,
  stringToHex,
} from '@/lib/web3';
import { type Log } from '@/lib/web3/types';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';

const campaignInfoFactory = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
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
  const { address, authenticated } = useAuth();
  const [campaignId, setCampaignId] = useState<number | undefined>();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const createCampaignContract = useCallback(
    async ({
      startTime,
      endTime,
      fundingGoal,
      campaignId,
      onStateChanged,
    }: {
      startTime: string;
      endTime: string;
      fundingGoal: string;
      campaignId: number;
      onStateChanged: (arg0: keyof typeof CreateProcessStates) => void;
    }) => {
      if (!authenticated) {
        throw new Error('wallet not connected');
      }
      const campaignData = {
        launchTime: BigInt(
          Math.floor(new Date(startTime ?? '').getTime() / 1000),
        ),
        deadline: BigInt(Math.floor(new Date(endTime ?? '').getTime() / 1000)),
        goalAmount: parseEther(fundingGoal || '0'),
      };
      setCampaignId(campaignId);

      // Then proceed with blockchain transaction
      const identifierHash = keccak256(stringToHex('KickStarter'));
      onStateChanged('createOnChain');
      await writeContractAsync({
        address: campaignInfoFactory as `0x${string}`,
        abi: CampaignInfoFactoryABI,
        functionName: 'createCampaign',
        args: [
          address,
          identifierHash,
          [process.env.NEXT_PUBLIC_PLATFORM_HASH as `0x${string}`],
          [], // Platform data keys
          [], // Platform data values
          campaignData,
        ],
      });
      onStateChanged('waitForCreationConfirmation');
      // -> useEffect: hash + state:success,
      // then the receipt has the address in the event-logs
    },
    [address, authenticated, writeContractAsync],
  );

  useEffect(() => {
    if (campaignId && hash && isSuccess && receipt) {
      const status = receipt.status;
      const event = receipt.logs.find(
        (log: Log) => log.transactionHash === hash,
      );
      const campaignAddress =
        status === 'success'
          ? (event?.address ?? receipt.logs?.at(0)?.address ?? '')
          : '';
      onConfirmed({ hash, status, campaignAddress, campaignId });
      setCampaignId(undefined);
    }
  }, [hash, isSuccess, receipt, onConfirmed, campaignId]);

  return {
    isPending,
    isConfirming,
    isSuccess,
    createCampaignContract,
    createCampaignContractHash: hash,
  };
}
