import { useCallback } from 'react';
import { ethers } from '@/lib/web3';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { useConnectorClient } from '@/lib/web3';
import { debugHook as debug } from '@/lib/debug';
import { USD_DECIMALS } from '@/lib/constant';

export interface CampaignData {
  id: number;
  startTime: Date;
  endTime: Date;
  fundingGoal: string;
  creatorAddress: string;
  title: string;
  description: string;
  status: string;
  transactionHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  campaignAddress: string | null;
  slug: string;
  location: string | null;
  treasuryAddress?: string | null;
  category?: string | null;
  mediaOrder?: string[] | null;
}

export interface DeploymentResult {
  txHash: string;
  campaignAddress: string | null;
  receipt: ethers.TransactionReceipt | null;
}

export function useAdminDeployCampaignContract() {
  const { data: client } = useConnectorClient();

  const deployCampaignContract = useCallback(
    async (campaign: CampaignData): Promise<DeploymentResult> => {
      if (!client) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(client);
        const signer = await ethersProvider.getSigner();

        // Get deployment configuration from environment
        const factoryAddr = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
        const globalPlatformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;
        const usdDecimals = USD_DECIMALS;

        if (!factoryAddr || !globalPlatformHash) {
          throw new Error(
            'Missing required environment variables for deployment',
          );
        }

        // Platform configuration
        const platformConfig = {
          flatFee: process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0',
          cumulativeFlatFee:
            process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0',
          platformFeeBps: parseInt(
            process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '0',
          ),
          vakiCommissionBps: parseInt(
            process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS || '0',
          ),
          launchOffsetSec: parseInt(
            process.env.NEXT_PUBLIC_LAUNCH_OFFSET_SEC || '300',
          ),
          minCampaignDurationSec: parseInt(
            process.env.NEXT_PUBLIC_MIN_CAMPAIGN_DURATION_SEC || '86400',
          ),
        };

        // Create factory contract instance
        const factory = new ethers.Contract(
          factoryAddr,
          CampaignInfoFactoryABI,
          signer,
        );

        // Prepare campaign data for contract deployment
        const providedLaunchTime = Math.floor(
          campaign.startTime.getTime() / 1000,
        );
        const providedDeadline = Math.floor(campaign.endTime.getTime() / 1000);

        const latestBlock = await ethersProvider.getBlock('latest');
        const blockchainNow = Number(
          latestBlock?.timestamp ?? Math.floor(Date.now() / 1000),
        );

        // Use configurable timing with reasonable defaults
        const launchTime = Math.max(
          providedLaunchTime,
          blockchainNow + platformConfig.launchOffsetSec,
        );
        const deadline = Math.max(
          providedDeadline,
          launchTime + platformConfig.minCampaignDurationSec,
        );

        const goalAmount = ethers.parseUnits(
          String(campaign.fundingGoal || '0'),
          usdDecimals,
        );

        // Generate meaningful campaign identifier
        const uniqueSuffix = `${campaign.creatorAddress.slice(2, 8)}-${campaign.id}-${Date.now()}`;
        const identifierHash = ethers.keccak256(
          ethers.toUtf8Bytes(`RELAYFUNDER-${uniqueSuffix}`),
        );

        // Platform data keys and values are empty - fees are configured in treasury
        const platformDataKeys: string[] = [];
        const platformDataValues: string[] = [];

        // Campaign timing and goal data
        const campaignData = [launchTime, deadline, goalAmount] as const;

        // Deploy campaign contract
        const tx = await factory.createCampaign(
          campaign.creatorAddress,
          identifierHash,
          [globalPlatformHash],
          platformDataKeys,
          platformDataValues,
          campaignData,
        );

        const receipt = await tx.wait();

        // Extract campaign address from factory event logs
        let campaignAddress: string | null = null;
        try {
          const eventTopic = ethers.id(
            'CampaignInfoFactoryCampaignCreated(bytes32,address)',
          );
          for (const log of receipt?.logs || []) {
            if (
              log?.topics?.[0] === eventTopic &&
              log?.address?.toLowerCase() === factoryAddr.toLowerCase()
            ) {
              // campaignInfoAddress is the second indexed parameter (topic[2])
              const campaignAddressTopic = log.topics[2];
              if (campaignAddressTopic && campaignAddressTopic.length === 66) {
                // Remove padding to get clean address
                campaignAddress = '0x' + campaignAddressTopic.slice(26);
                break;
              }
            }
          }
        } catch (decodeErr) {
          console.error(
            'Failed to decode campaignAddress from logs',
            decodeErr,
          );
        }

        debug &&
          console.log(`Campaign contract deployed at: ${campaignAddress}`);
        debug && console.log(`Transaction hash: ${tx.hash}`);

        return {
          txHash: tx.hash,
          campaignAddress,
          receipt,
        };
      } catch (error) {
        console.error('Campaign contract deployment error:', error);
        throw error;
      }
    },
    [client],
  );

  return { deployCampaignContract };
}
