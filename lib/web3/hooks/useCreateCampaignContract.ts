import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts';

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
  campaignAddress: string;
  event?: Log<bigint, number, false>;
}
export function useCreateCampaignContract({
  onConfirmed,
}: {
  onConfirmed: (arg0: IOnCreateCampaignConfirmed) => void;
}) {
  const { address, authenticated } = useAuth();
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
    }: {
      startTime: string;
      endTime: string;
      fundingGoal: string;
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

      // Then proceed with blockchain transaction
      const identifierHash = keccak256(stringToHex('KickStarter'));
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
    },
    [address, authenticated, writeContractAsync],
  );

  useEffect(() => {
    if (hash && isSuccess && receipt) {
      const campaignAddress = receipt.logs[0].address;
      const status = receipt.status;
      const event = receipt.logs.find(
        (log: Log) => log.transactionHash === hash,
      );
      onConfirmed({ hash, status, campaignAddress, event });
    }
  }, [hash, isSuccess, receipt, onConfirmed]);
  return {
    isPending,
    isConfirming,
    isSuccess,
    createCampaignContract,
    createCampaignContractHash: hash,
  };
}
