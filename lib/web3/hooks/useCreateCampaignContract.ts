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
import { ensurePlatformSetup } from '@/lib/web3/platform-setup';

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

      // Ensure platform setup before campaign creation
      onStateChanged('validatingPlatform');

      // Debug: Check current platform status
      console.log('Checking platform setup status before campaign creation...');

      const platformSetup = await ensurePlatformSetup();
      console.log('Platform setup result:', platformSetup);

      if (!platformSetup.success) {
        console.warn(`Platform setup warning: ${platformSetup.error}`);
        // Don't fail campaign creation if platform setup fails
        // Campaign creation can proceed even if platform isn't fully set up
      }
      // Recompute timing just before creation to avoid drift (like kwr_flow_test.sh)
      const now = Math.floor(Date.now() / 1000);
      const launchTime = Math.floor(new Date(startTime ?? '').getTime() / 1000);
      const deadline = Math.floor(new Date(endTime ?? '').getTime() / 1000);

      console.log('Timing validation:', {
        now,
        launchTime,
        deadline,
        launchTimeIsFuture: launchTime > now,
        deadlineIsAfterLaunch: deadline > launchTime,
      });

      const campaignData = {
        launchTime: BigInt(launchTime),
        deadline: BigInt(deadline),
        goalAmount: parseEther(fundingGoal || '0'),
      };

      console.log('Final campaign data:', campaignData);
      setCampaignId(campaignId);

      // Then proceed with blockchain transaction
      const identifierHash = keccak256(stringToHex('KickStarter'));

      // Platform data keys as per kwr_flow_test.sh
      const platformDataKeys = [
        keccak256(stringToHex('flatFee')),
        keccak256(stringToHex('cumulativeFlatFee')),
        keccak256(stringToHex('platformFee')),
        keccak256(stringToHex('vakiCommission')),
      ];

      // Platform data values - minimal fees configuration
      const FLAT_FEE_AMOUNT = 0; // 0 USDC (set to 0 as requested)
      const CUM_FLAT_FEE_AMOUNT = 0; // 0 USDC (set to 0 as requested)
      const PLATFORM_FEE_BPS = 400; // 4% in basis points (configurable, reduced from 10%)
      const VAKI_COMMISSION_BPS = 0; // 0% in basis points (set to 0 as requested)

      const platformDataValues = [
        `0x${FLAT_FEE_AMOUNT.toString(16).padStart(64, '0')}`,
        `0x${CUM_FLAT_FEE_AMOUNT.toString(16).padStart(64, '0')}`,
        `0x${PLATFORM_FEE_BPS.toString(16).padStart(64, '0')}`,
        `0x${VAKI_COMMISSION_BPS.toString(16).padStart(64, '0')}`,
      ];

      onStateChanged('createOnChain');

      console.log('Submitting campaign creation transaction:', {
        campaignInfoFactoryAddress: campaignInfoFactory,
        creatorAddress: address,
        identifierHash,
        platformHash: process.env.NEXT_PUBLIC_PLATFORM_HASH,
        platformDataKeys,
        platformDataValues,
        campaignData,
      });

      // Additional validation logging
      console.log('Contract addresses validation:', {
        campaignInfoFactory: campaignInfoFactory,
        isValidAddress: campaignInfoFactory ? /^0x[a-fA-F0-9]{40}$/.test(campaignInfoFactory) : false,
        platformHash: process.env.NEXT_PUBLIC_PLATFORM_HASH,
        isValidPlatformHash: process.env.NEXT_PUBLIC_PLATFORM_HASH ? /^0x[a-fA-F0-9]{64}$/.test(process.env.NEXT_PUBLIC_PLATFORM_HASH) : false,
      });

      try {
        // Small delay before transaction submission (like kwr_flow_test.sh)
        console.log('Waiting 1 second before transaction submission...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await writeContractAsync({
          address: campaignInfoFactory as `0x${string}`,
          abi: CampaignInfoFactoryABI,
          functionName: 'createCampaign',
          args: [
            address,
            identifierHash,
            [process.env.NEXT_PUBLIC_PLATFORM_HASH as `0x${string}`],
            platformDataKeys,
            platformDataValues,
            campaignData,
          ],
        });
        console.log('Transaction submitted successfully');
        onStateChanged('waitForCreationConfirmation');
      } catch (error) {
        console.error('Transaction submission failed:', error);
        throw error;
      }
      // -> useEffect: hash + state:success,
      // then the receipt has the address in the event-logs
    },
    [address, authenticated, writeContractAsync],
  );

  useEffect(() => {
    console.log('Transaction confirmation status:', {
      campaignId,
      hash,
      isSuccess,
      receipt: receipt ? 'received' : 'pending',
      isConfirming
    });

    if (campaignId && hash && isSuccess && receipt) {
      const status = receipt.status;
      console.log('Transaction confirmed:', { status, hash });

      const event = receipt.logs.find(
        (log: Log) => log.transactionHash === hash,
      );
      const campaignAddress =
        status === 'success'
          ? (event?.address ?? receipt.logs?.at(0)?.address ?? '')
          : '';

      console.log('Campaign address extracted:', campaignAddress);
      onConfirmed({ hash, status, campaignAddress, campaignId });
      setCampaignId(undefined);
    } else if (campaignId && hash && !isConfirming && !isSuccess) {
      console.error('Transaction failed or timed out:', { hash, isConfirming, isSuccess });
      // Handle failed transaction
      onConfirmed({ hash, status: 'failed', campaignAddress: '', campaignId });
      setCampaignId(undefined);
    }
  }, [hash, isSuccess, receipt, onConfirmed, campaignId, isConfirming]);

  return {
    isPending,
    isConfirming,
    isSuccess,
    createCampaignContract,
    createCampaignContractHash: hash,
  };
}
