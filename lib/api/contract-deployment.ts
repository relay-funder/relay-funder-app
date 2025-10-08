import { ethers } from 'ethers';
import { chainConfig } from '@/lib/web3';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { ApiIntegrityError } from '@/lib/api/error';
import type { DbCampaign } from '@/types/campaign';

export interface DeploymentConfig {
  factoryAddr: string;
  globalPlatformHash: string;
  usdcDecimals: number;
  platformConfig: {
    flatFee: string;
    cumulativeFlatFee: string;
    platformFeeBps: number;
    vakiCommissionBps: number;
    launchOffsetSec: number;
    minCampaignDurationSec: number;
  };
}

export interface DeploymentResult {
  txHash: string;
  campaignAddress: string | null;
  receipt: ethers.TransactionReceipt | null;
}

/**
 * Deploy a campaign contract using the factory
 */
export async function deployCampaignContract(
  campaign: DbCampaign,
  config: DeploymentConfig,
): Promise<DeploymentResult> {
  // Set up provider and signer
  const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
  const platformAdminSigner = new ethers.Wallet(
    config.platformAdminKey,
    provider,
  );

  // Create factory contract instance
  const factory = new ethers.Contract(
    config.factoryAddr,
    CampaignInfoFactoryABI,
    platformAdminSigner,
  );

  // Prepare campaign data for contract deployment
  const providedLaunchTime = Math.floor(campaign.startTime.getTime() / 1000);
  const providedDeadline = Math.floor(campaign.endTime.getTime() / 1000);

  const latestBlock = await provider.getBlock('latest');
  const blockchainNow = Number(
    latestBlock?.timestamp ?? Math.floor(Date.now() / 1000),
  );

  // Use configurable timing with reasonable defaults
  const launchTime = Math.max(
    providedLaunchTime,
    blockchainNow + config.platformConfig.launchOffsetSec,
  );
  const deadline = Math.max(
    providedDeadline,
    launchTime + config.platformConfig.minCampaignDurationSec,
  );

  const goalAmount = ethers.parseUnits(
    String(campaign.fundingGoal || '0'),
    config.usdcDecimals,
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
    [config.globalPlatformHash],
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
        log?.address?.toLowerCase() === config.factoryAddr.toLowerCase()
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
    console.error('Failed to decode campaignAddress from logs', decodeErr);
  }

  return {
    txHash: tx.hash,
    campaignAddress,
    receipt,
  };
}

/**
 * Get deployment configuration from environment variables
 */
export function getDeploymentConfig(): DeploymentConfig {
  const factoryAddr = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
  const globalPlatformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;
  const usdcDecimals = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS || 6);

  if (!factoryAddr || !globalPlatformHash) {
    throw new ApiIntegrityError('Missing required environment variables');
  }

  // Platform configuration (matching working create-onchain endpoint)
  const platformConfig = {
    flatFee: process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0', // 0 USDC per pledge
    cumulativeFlatFee:
      process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0', // 0 USDC threshold
    platformFeeBps: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '0'), // 0% platform fee
    vakiCommissionBps: parseInt(
      process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS || '0',
    ), // 0% commission
    launchOffsetSec: parseInt(
      process.env.NEXT_PUBLIC_LAUNCH_OFFSET_SEC || '300',
    ), // 5 minute buffer
    minCampaignDurationSec: parseInt(
      process.env.NEXT_PUBLIC_MIN_CAMPAIGN_DURATION_SEC || '86400',
    ), // 24 hours minimum
  };

  return {
    factoryAddr,
    globalPlatformHash,
    usdcDecimals,
    platformConfig,
  };
}
