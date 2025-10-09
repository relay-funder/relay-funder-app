import { ethers } from '@/lib/web3';
import { response, handleError } from '@/lib/api/response';
import { db } from '@/server/db';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiAuthNotAllowed,
} from '@/lib/api/error';
import { debugApi as debug } from '@/lib/debug';

import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  checkIpLimit,
  checkUserLimit,
  ipLimiterCreateCampaignOnChain,
  userLimiterCreateCampaignOnChain,
} from '@/lib/rate-limit';
import { CampaignsWithIdParams } from '@/lib/api/types';

/**
 * # Platform Fee Configuration
 * NEXT_PUBLIC_PLATFORM_FLAT_FEE=0.001          # Flat fee per pledge (USDC)
 * NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE=0.002 # Cumulative flat fee threshold (USDC)
 * NEXT_PUBLIC_PLATFORM_FEE_BPS=400             # Platform fee percentage (400 = 4%)
 * NEXT_PUBLIC_VAKI_COMMISSION_BPS=100          # Vaki commission percentage (100 = 1%)
 * NEXT_PUBLIC_FEE_EXEMPTION_THRESHOLD=0.5      # Fee exemption threshold (USDC)
 * # Campaign Timing Configuration
 * NEXT_PUBLIC_LAUNCH_OFFSET_SEC=300            # Minimum seconds before launch (300 = 5 minutes)
 * NEXT_PUBLIC_MIN_CAMPAIGN_DURATION_SEC=86400  # Minimum campaign duration (86400 = 24 hours)
 */

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    await checkIpLimit(req.headers, ipLimiterCreateCampaignOnChain);

    const session = await checkAuth(['user']);
    const creatorAddress = session.user.address;

    await checkUserLimit(creatorAddress, userLimiterCreateCampaignOnChain);

    const { campaignId } = await params;
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL as string;
    const factoryAddr = process.env
      .NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY as `0x${string}`;
    const globalPlatformHash = process.env
      .NEXT_PUBLIC_PLATFORM_HASH as `0x${string}`;
    const usdcDecimals = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS || 6);

    // Platform configuration - should be configurable per platform/environment
    const platformConfig = {
      // Fee structure (in USDC)
      flatFee: process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0', // 0 USDC per pledge
      cumulativeFlatFee:
        process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0', // 0 USDC threshold
      platformFeeBps: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '0'), // 0% platform fee
      vakiCommissionBps: parseInt(
        process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS || '0',
      ), // 0% commission

      // Timing configuration (in seconds)
      launchOffsetSec: parseInt(
        process.env.NEXT_PUBLIC_LAUNCH_OFFSET_SEC || '300',
      ), // 5 minute buffer
      minCampaignDurationSec: parseInt(
        process.env.NEXT_PUBLIC_MIN_CAMPAIGN_DURATION_SEC || '86400',
      ), // 24 hours minimum

      // Platform settings
      feeExemptionThreshold:
        process.env.NEXT_PUBLIC_FEE_EXEMPTION_THRESHOLD || '0.5', // 0.5 USDC threshold
    };

    const sponsorPrivateKey = process.env
      .PLATFORM_SPONSOR_PRIVATE_KEY as string;
    if (!rpcUrl || !factoryAddr || !globalPlatformHash || !sponsorPrivateKey) {
      console.warn('[campaigns/create-onchain] Missing env', {
        hasRpcUrl: !!rpcUrl,
        hasFactory: !!factoryAddr,
        hasPlatformHash: !!globalPlatformHash,
        hasSponsorPrivateKey: !!sponsorPrivateKey,
      });
      throw new ApiParameterError('Missing required env vars');
    }

    const id = Number(campaignId);
    if (!Number.isFinite(id)) {
      throw new ApiParameterError('Invalid campaignId');
    }

    // Load campaign data from DB
    const campaign = await db.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    if (campaign.creatorAddress !== session.user.address) {
      if (!(await isAdmin())) {
        throw new ApiAuthNotAllowed(
          'Cannot execute CampaignInfoFactory for not owned Campaign',
        );
      }
    }

    // Validate platform configuration
    if (
      platformConfig.platformFeeBps > 10000 ||
      platformConfig.vakiCommissionBps > 10000
    ) {
      throw new ApiParameterError('Fee percentages cannot exceed 100%');
    }
    const { isDummy } = await require('@/lib/web3');
    if (isDummy) {
      const updatedCampaign = await db.campaign.update({
        where: { id },
        data: {
          transactionHash: `0x${Math.round(Math.random() * 100000).toString(16)}`,
          campaignAddress: `0x${Math.round(Math.random() * 100000).toString(16)}`,
        },
      });

      return response({
        success: true,
        txHash: updatedCampaign.transactionHash,
        status: 1,
        campaignAddress: updatedCampaign.campaignAddress,
      });
    }
    // Build inputs aligned to shell script
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(sponsorPrivateKey, provider);
    const factory = new ethers.Contract(
      factoryAddr,
      CampaignInfoFactoryABI,
      signer,
    );

    // Compute campaign timing with realistic buffers for production use
    const providedLaunch = Math.floor(
      new Date(campaign.startTime).getTime() / 1000,
    );
    const providedDeadline = Math.floor(
      new Date(campaign.endTime).getTime() / 1000,
    );

    const latestBlock = await provider.getBlock('latest');
    const blockchainNow = Number(
      latestBlock?.timestamp ?? Math.floor(Date.now() / 1000),
    );

    // Use configurable timing with reasonable defaults for production
    const launchBuffer = platformConfig.launchOffsetSec; // Default: 5 minute buffer
    const minDuration = platformConfig.minCampaignDurationSec; // Default: 24 hours minimum

    // Ensure campaign can launch with proper buffer time
    const launchTime = Math.max(providedLaunch, blockchainNow + launchBuffer);

    // Ensure minimum campaign duration from launch time
    const deadline = Math.max(providedDeadline, launchTime + minDuration);

    // Validate timing makes sense for a crowdfunding campaign
    const campaignDuration = deadline - launchTime;
    if (campaignDuration < minDuration) {
      throw new ApiParameterError(
        `Campaign duration must be at least ${minDuration / 3600} hours`,
      );
    }
    if (campaignDuration > 90 * 24 * 3600) {
      // Max 90 days
      throw new ApiParameterError('Campaign duration cannot exceed 90 days');
    }

    const goalAmount = ethers.parseUnits(
      String(campaign.fundingGoal || '0'),
      usdcDecimals,
    );

    // Generate meaningful campaign identifier for production use
    const uniqueSuffix = `${campaign.creatorAddress.slice(2, 8)}-${id}-${Date.now()}`;
    const identifierHash = ethers.keccak256(
      ethers.toUtf8Bytes(`RELAYFUNDER-${uniqueSuffix}`),
    );

    // Platform data keys and values are empty - fees are configured in treasury
    const platformDataKeys: string[] = [];
    const platformDataValues: string[] = [];

    const campaignData = [launchTime, deadline, goalAmount] as const;

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
      // Failed to decode campaignAddress from logs
    }

    // Persist on chain info to DB
    // Update database with actual on-chain timing for treasury configuration
    // The campaign contract enforces minimum launch offset and duration,
    // so we must sync the DB with these adjusted values
    try {
      await db.campaign.update({
        where: { id },
        data: {
          transactionHash: tx.hash,
          campaignAddress: campaignAddress ?? undefined,
          startTime: new Date(launchTime * 1000),
          endTime: new Date(deadline * 1000),
        },
      });
      debug &&
        console.log(
          `[campaigns/create-onchain] Updated DB with on-chain timing: launchTime=${launchTime}, deadline=${deadline}`,
        );
    } catch (persistErr) {
      console.error(
        '[campaigns/create-onchain] Failed to persist on-chain info',
        persistErr,
      );
      // continue returning tx info even if persistence fails; client can retry
    }

    return response({
      success: true,
      txHash: tx.hash,
      status: receipt?.status,
      campaignAddress,
    });
  } catch (error: unknown) {
    console.error('[campaigns/create-onchain] Error', error);
    return handleError(error);
  }
}
