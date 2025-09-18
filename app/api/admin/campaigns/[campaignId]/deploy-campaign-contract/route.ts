import { db } from '@/server/db';
import { checkAuth, checkContractAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiIntegrityError,
  ApiUpstreamError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';
import { ethers } from 'ethers';
import { chainConfig } from '@/lib/web3';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';

interface DeployCampaignContractResponse {
  success: boolean;
  txHash?: string;
  status?: number;
  campaignAddress?: string;
  campaign?: any;
}

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }

    // Get campaign info from database
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    // Check if campaign already has an on-chain address
    if (campaign.campaignAddress) {
      throw new ApiIntegrityError('Campaign contract already deployed');
    }

    // Admin can deploy contracts for campaigns in any status

    // Get environment variables (using same config as working create-onchain endpoint)
    const factoryAddr = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
    const globalPlatformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;
    const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;
    const usdcDecimals = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS || 6);

    if (!factoryAddr || !globalPlatformHash || !platformAdminKey) {
      throw new ApiIntegrityError('Missing required environment variables');
    }

    // Set up provider and signer
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    const platformAdminSigner = new ethers.Wallet(platformAdminKey, provider);

    // Create factory contract instance
    const factory = new ethers.Contract(
      factoryAddr,
      CampaignInfoFactoryABI,
      platformAdminSigner,
    );

    // Platform configuration (matching working create-onchain endpoint)
    const platformConfig = {
      flatFee: process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0.001', // 0.001 USDC per pledge
      cumulativeFlatFee:
        process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0.002', // 0.002 USDC threshold
      platformFeeBps: parseInt(
        process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '400',
      ), // 4% platform fee
      vakiCommissionBps: parseInt(
        process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS || '100',
      ), // 1% commission
      launchOffsetSec: parseInt(
        process.env.NEXT_PUBLIC_LAUNCH_OFFSET_SEC || '3600',
      ), // 1 hour buffer
      minCampaignDurationSec: parseInt(
        process.env.NEXT_PUBLIC_MIN_CAMPAIGN_DURATION_SEC || '86400',
      ), // 24 hours minimum
    };

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
      blockchainNow + platformConfig.launchOffsetSec,
    );
    const deadline = Math.max(
      providedDeadline,
      launchTime + platformConfig.minCampaignDurationSec,
    );

    const goalAmount = ethers.parseUnits(
      String(campaign.fundingGoal || '0'),
      usdcDecimals,
    );

    // Generate meaningful campaign identifier
    const uniqueSuffix = `${campaign.creatorAddress.slice(2, 8)}-${campaign.id}-${Date.now()}`;
    const identifierHash = ethers.keccak256(
      ethers.toUtf8Bytes(`AKASHIC-${uniqueSuffix}`),
    );

    // Use configurable fee structure (same as working implementation)
    const feeKeys = [
      'flatFee',
      'cumulativeFlatFee',
      'platformFee',
      'vakiCommission',
    ];
    const platformDataKeys = feeKeys.map((n) =>
      ethers.keccak256(ethers.toUtf8Bytes(n)),
    );

    // Parse fee values from configuration
    const flatFee = ethers.parseUnits(platformConfig.flatFee, usdcDecimals);
    const cumulativeFlatFee = ethers.parseUnits(
      platformConfig.cumulativeFlatFee,
      usdcDecimals,
    );
    const platformFeeBps = platformConfig.platformFeeBps;
    const vakiCommissionBps = platformConfig.vakiCommissionBps;

    const toBytes32 = (n: bigint | number) =>
      `0x${BigInt(n).toString(16).padStart(64, '0')}`;
    const platformDataValues = [
      toBytes32(flatFee),
      toBytes32(cumulativeFlatFee),
      toBytes32(platformFeeBps),
      toBytes32(vakiCommissionBps),
    ];

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
      console.error('Failed to decode campaignAddress from logs', decodeErr);
    }

    // Update campaign in database with contract info
    try {
      await db.campaign.update({
        where: { id: campaignId },
        data: {
          transactionHash: tx.hash,
          campaignAddress: campaignAddress ?? undefined,
        },
      });
    } catch (persistErr) {
      console.error(
        '[admin/deploy-campaign-contract] Failed to persist contract info',
        persistErr,
      );
      throw new ApiUpstreamError(
        'Failed to update campaign with contract info',
      );
    }

    return response({
      success: true,
      txHash: tx.hash,
      status: receipt?.status,
      campaignAddress,
      campaign: await getCampaign(campaignId),
    } as DeployCampaignContractResponse);
  } catch (error: unknown) {
    console.error('[admin/deploy-campaign-contract] Error', error);
    return handleError(error);
  }
}
