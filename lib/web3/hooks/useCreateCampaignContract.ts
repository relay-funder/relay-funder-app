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
      console.log('🔗 createCampaignContract called with:', {
        startTime,
        endTime,
        fundingGoal,
        authenticated,
        address,
        campaignInfoFactory
      });
      
      if (!authenticated) {
        console.error('❌ Wallet not authenticated');
        throw new Error('wallet not connected');
      }
      
      const campaignData = {
        launchTime: BigInt(new Date(startTime ?? '').getTime() / 1000),
        deadline: BigInt(new Date(endTime ?? '').getTime() / 1000),
        goalAmount: parseEther(fundingGoal || '0'),
      };

      console.log('📋 Campaign data prepared:', {
        launchTime: campaignData.launchTime.toString(),
        deadline: campaignData.deadline.toString(),
        goalAmount: campaignData.goalAmount.toString()
      });

      // Then proceed with blockchain transaction
      // Generate a unique identifier based on campaign data and timestamp
      const uniqueString = `KickStarter-${Date.now()}-${address}-${campaignData.launchTime}`;
      const identifierHash = keccak256(stringToHex(uniqueString));
      console.log('🔑 Unique identifier hash:', identifierHash, 'from:', uniqueString);
      
      const contractArgs = [
        address, // Use connected wallet as creator (this is correct!)
        identifierHash,
        [process.env.NEXT_PUBLIC_PLATFORM_HASH as `0x${string}`],
        [], // Platform data keys
        [], // Platform data values
        campaignData,
      ];
      
      console.log('📞 Calling writeContractAsync with:', {
        address: campaignInfoFactory,
        functionName: 'createCampaign',
        args: contractArgs,
        creator: address, // Connected wallet is the creator
        identifierHash: identifierHash
      });
      
      try {
        const result = await writeContractAsync({
          address: campaignInfoFactory as `0x${string}`,
          abi: CampaignInfoFactoryABI,
          functionName: 'createCampaign',
          args: contractArgs,
        });
        
        console.log('✅ writeContractAsync completed:', result);
        return result;
      } catch (error) {
        console.error('❌ writeContractAsync failed:', error);
        throw error;
      }
    },
    [address, authenticated, writeContractAsync],
  );

  useEffect(() => {
    console.log('🔍 useCreateCampaignContract state:', {
      hash,
      isSuccess,
      receipt: !!receipt,
      isPending,
      isConfirming,
      receiptStatus: receipt?.status,
      receiptLogs: receipt?.logs?.length
    });
    
    // Check for failed transactions
    if (hash && receipt && receipt.status === 'reverted') {
      console.error('❌ Transaction failed/reverted:', {
        hash,
        status: receipt.status,
        gasUsed: receipt.gasUsed,
        logs: receipt.logs
      });
      
      // Call onConfirmed with failure status so the UI can handle it
      onConfirmed({ 
        hash, 
        status: 'failed', 
        campaignAddress: '', 
        event: undefined 
      });
      return;
    }
    
    if (hash && isSuccess && receipt) {
      console.log('🎉 All conditions met, calling onConfirmed');
      console.log('📋 Receipt details:', {
        status: receipt.status,
        logs: receipt.logs,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      });
      
      const campaignAddress = receipt.logs[0]?.address;
      const status = receipt.status;
      const event = receipt.logs.find(
        (log: Log) => log.transactionHash === hash,
      );
      
      console.log('📍 Extracted data:', {
        campaignAddress,
        status,
        event: !!event,
        hash
      });
      
      if (!campaignAddress) {
        console.error('❌ No campaign address found in logs');
        onConfirmed({ 
          hash, 
          status: 'failed', 
          campaignAddress: '', 
          event: undefined 
        });
        return;
      }
      
      onConfirmed({ hash, status, campaignAddress, event });
    } else {
      console.log('⏳ Waiting for transaction completion...', {
        hasHash: !!hash,
        isSuccess,
        hasReceipt: !!receipt,
        receiptStatus: receipt?.status
      });
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
