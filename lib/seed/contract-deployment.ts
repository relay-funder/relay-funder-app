/**
 * Contract deployment utilities for seed script
 * Allows automatic deployment of campaign and treasury contracts during seeding
 */

import { config } from 'dotenv';
import { ethers } from 'ethers';
import { chainConfig } from '@/lib/web3';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { createTreasuryManager } from '@/lib/treasury/interface';
import { debugWeb3 as debug } from '@/lib/debug';
import { normalizeAddress } from '@/lib/normalize-address';

/**
 * Categorize deployment errors for better reporting
 */
function categorizeError(error: unknown): {
  errorType: string;
  friendlyMessage: string;
} {
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (errorMessage.includes('insufficient funds')) {
    return {
      errorType: 'INSUFFICIENT_FUNDS',
      friendlyMessage:
        'Wallet has insufficient funds to cover gas costs. Please add more funds to the platform admin wallet.',
    };
  }

  if (
    errorMessage.includes('gas') &&
    (errorMessage.includes('limit') || errorMessage.includes('exceeded'))
  ) {
    return {
      errorType: 'GAS_LIMIT',
      friendlyMessage:
        'Transaction exceeded gas limit. The contract deployment requires more gas than allowed.',
    };
  }

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return {
      errorType: 'NETWORK_ERROR',
      friendlyMessage:
        'Network connection issue. Please check your RPC endpoint and internet connection.',
    };
  }

  if (
    errorMessage.includes('revert') ||
    errorMessage.includes('execution reverted')
  ) {
    return {
      errorType: 'CONTRACT_ERROR',
      friendlyMessage:
        'Contract execution failed. Check contract parameters and blockchain state.',
    };
  }

  return {
    errorType: 'UNKNOWN',
    friendlyMessage: 'Unknown deployment error occurred.',
  };
}

// Load environment variables
config({ path: '.env.local' });

interface CampaignContractDeployment {
  campaignAddress: string;
  transactionHash: string;
  success: boolean;
  error?: string;
  errorType?:
    | 'INSUFFICIENT_FUNDS'
    | 'GAS_LIMIT'
    | 'NETWORK_ERROR'
    | 'CONTRACT_ERROR'
    | 'UNKNOWN';
}

interface TreasuryContractDeployment {
  treasuryAddress: string;
  transactionHash: string;
  success: boolean;
  error?: string;
  errorType?:
    | 'INSUFFICIENT_FUNDS'
    | 'GAS_LIMIT'
    | 'NETWORK_ERROR'
    | 'CONTRACT_ERROR'
    | 'UNKNOWN';
}

interface CampaignData {
  id: number;
  title: string;
  creatorAddress: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Deploy a campaign contract using CampaignInfoFactory
 * @param campaignData Campaign data for deployment
 * @param isDummy If true, bypasses blockchain interactions and returns mock data
 */
export async function deployCampaignContract(
  campaignData: CampaignData,
  db: { campaign: { update: (args: { where: { id: number }, data: { startTime: Date; endTime: Date } }) => Promise<unknown> } },
  isDummy: boolean = false,
): Promise<CampaignContractDeployment> {
  try {
    debug &&
      console.log(`Deploying campaign contract for: ${campaignData.title}`);

    // Dummy mode: simulate contract deployment without blockchain interaction
    if (isDummy) {
      debug &&
        console.log('  Running in dummy mode - simulating deployment...');

      // Generate realistic mock contract address
      const timestamp = Date.now();
      const campaignAddress = `0x${timestamp.toString(16).padStart(8, '0')}${'0'.repeat(32)}`;

      // Generate realistic mock transaction hash
      const transactionHash = `0x${BigInt(timestamp).toString(16)}${'0'.repeat(56)}`;

      debug &&
        console.log(
          `  Campaign contract deployed (dummy) at: ${campaignAddress}`,
        );
      debug && console.log(`  Transaction hash (dummy): ${transactionHash}`);

      return {
        campaignAddress,
        transactionHash,
        success: true,
      };
    }

    // Get required environment variables
    const factoryAddr = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
    const globalPlatformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;
    const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;
    const usdcDecimals = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS || 6);

    if (!factoryAddr || !globalPlatformHash || !platformAdminKey) {
      const missingVars = [];
      if (!factoryAddr) missingVars.push('NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY');
      if (!globalPlatformHash) missingVars.push('NEXT_PUBLIC_PLATFORM_HASH');
      if (!platformAdminKey) missingVars.push('PLATFORM_ADMIN_PRIVATE_KEY');
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
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

    // Platform configuration
    const platformConfig = {
      flatFee: process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0',
      cumulativeFlatFee:
        process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0',
      platformFeeBps: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '0'),
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

    // Prepare campaign timing
    const providedLaunchTime = Math.floor(
      campaignData.startTime.getTime() / 1000,
    );
    const providedDeadline = Math.floor(campaignData.endTime.getTime() / 1000);

    const latestBlock = await provider.getBlock('latest');
    const blockchainNow = Number(
      latestBlock?.timestamp ?? Math.floor(Date.now() / 1000),
    );

    const launchTime = Math.max(
      providedLaunchTime,
      blockchainNow + platformConfig.launchOffsetSec,
    );
    const deadline = Math.max(
      providedDeadline,
      launchTime + platformConfig.minCampaignDurationSec,
    );

    const goalAmount = ethers.parseUnits(
      String(campaignData.fundingGoal || '0'),
      usdcDecimals,
    );

    // Generate unique campaign identifier
    const uniqueSuffix = `${campaignData.creatorAddress.slice(2, 8)}-${campaignData.id}-${Date.now()}`;
    const identifierHash = ethers.keccak256(
      ethers.toUtf8Bytes(`RELAYFUNDER-SEED-${uniqueSuffix}`),
    );

    // Platform data keys and values are empty - fees are configured in treasury
    const platformDataKeys: string[] = [];
    const platformDataValues: string[] = [];

    const campaignDataArray = [launchTime, deadline, goalAmount] as const;

    // Deploy campaign contract
    debug && console.log('  Submitting contract deployment transaction...');
    const tx = await factory.createCampaign(
      campaignData.creatorAddress,
      identifierHash,
      [globalPlatformHash],
      platformDataKeys,
      platformDataValues,
      campaignDataArray,
    );

    debug && console.log('  Waiting for transaction confirmation...');
    const receipt = await tx.wait();

    // Extract campaign address from factory event logs (using same logic as working admin endpoint)
    let campaignAddress: string | null = null;
    try {
      const eventTopic = ethers.id(
        'CampaignInfoFactoryCampaignCreated(bytes32,address)',
      );
      for (const log of receipt?.logs || []) {
        if (
          log?.topics?.[0] === eventTopic &&
          normalizeAddress(log?.address) === normalizeAddress(factoryAddr)
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
    } catch (parseError) {
      console.warn('  Could not parse event logs:', parseError);
    }

    if (!campaignAddress) {
      throw new Error(
        'Failed to extract campaign address from transaction receipt',
      );
    }

    debug && console.log(`  Campaign contract deployed at: ${campaignAddress}`);
    debug && console.log(`  Transaction hash: ${receipt.hash}`);

    // Update database with actual on-chain timing for treasury configuration
    // The campaign contract enforces minimum launch offset and duration, so we need to sync the DB
    try {
      await db.campaign.update({
        where: { id: campaignData.id },
        data: {
          startTime: new Date(launchTime * 1000),
          endTime: new Date(deadline * 1000),
        },
      });
      debug &&
        console.log(
          `  Updated database with on-chain timing: launchTime=${launchTime}, deadline=${deadline}`,
        );
    } catch (dbError) {
      console.warn('  Failed to update database with on-chain timing:', dbError);
      // Continue anyway - this is not critical for contract deployment
    }

    return {
      campaignAddress,
      transactionHash: receipt.hash,
      success: true,
    };
  } catch (error) {
    const { errorType, friendlyMessage } = categorizeError(error);
    console.error(
      `  Failed to deploy campaign contract for ${campaignData.title}:`,
    );
    console.error(`  Error Type: ${errorType}`);
    console.error(`  Details: ${friendlyMessage}`);

    return {
      campaignAddress: '',
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: errorType as
        | 'INSUFFICIENT_FUNDS'
        | 'GAS_LIMIT'
        | 'NETWORK_ERROR'
        | 'CONTRACT_ERROR'
        | 'UNKNOWN',
    };
  }
}

/**
 * Deploy a treasury contract using TreasuryManager
 * @param campaignId Campaign ID for treasury deployment
 * @param campaignAddress Address of the associated campaign contract
 * @param isDummy If true, bypasses blockchain interactions and returns mock data
 */
export async function deployTreasuryContract(
  campaignId: number,
  campaignAddress: string,
  isDummy: boolean = false,
  skipConfig: boolean = false,
): Promise<TreasuryContractDeployment> {
  try {
    debug &&
      console.log(`Deploying treasury contract for campaign ${campaignId}`);

    // Dummy mode: simulate treasury deployment without blockchain interaction
    if (isDummy) {
      console.log(
        '  Running in dummy mode - simulating treasury deployment...',
      );

      // Generate realistic mock treasury address (different prefix from campaign)
      const timestamp = Date.now() + campaignId;
      const treasuryAddress = `0x${(timestamp + 0x7000000).toString(16).padStart(8, '7')}${'0'.repeat(32)}`;

      // Generate realistic mock transaction hash
      const transactionHash = `0x${BigInt(timestamp + 1000).toString(16)}${'0'.repeat(56)}`;

      console.log(
        `  Treasury contract deployed (dummy) at: ${treasuryAddress}`,
      );
      console.log(`  Transaction hash (dummy): ${transactionHash}`);
      console.log('  Treasury configured successfully (dummy)');

      return {
        treasuryAddress,
        transactionHash,
        success: true,
      };
    }

    const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;
    const platformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;

    if (!platformAdminKey || !platformHash) {
      const missingVars = [];
      if (!platformAdminKey) missingVars.push('PLATFORM_ADMIN_PRIVATE_KEY');
      if (!platformHash) missingVars.push('NEXT_PUBLIC_PLATFORM_HASH');
      throw new Error(
        `Missing required environment variables for treasury deployment: ${missingVars.join(', ')}`,
      );
    }

    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    const platformAdminSigner = new ethers.Wallet(platformAdminKey, provider);

    const treasuryManager = await createTreasuryManager();

    debug && console.log('  Deploying treasury via TreasuryManager...');
    const deployResult = await treasuryManager.deploy({
      campaignId,
      platformBytes: platformHash,
      campaignAddress,
      signer: platformAdminSigner,
    });

    if (deployResult.deploymentStatus !== 'success') {
      throw new Error(`Treasury deployment failed: ${deployResult.error}`);
    }

    debug &&
      console.log(`  Treasury contract deployed at: ${deployResult.address}`);
    debug && console.log(`  Transaction hash: ${deployResult.transactionHash}`);

    // Configure treasury with campaign parameters (unless skipped)
    if (!skipConfig) {
      debug && console.log('  Configuring treasury...');
      const configResult = await treasuryManager.configureTreasury(
        deployResult.address,
        campaignId,
        platformAdminSigner,
      );

      if (!configResult.success) {
        throw new Error(
          `Treasury configuration failed: ${configResult.error}. Treasury deployed but not configured.`,
        );
      }

      debug && console.log('  Treasury configured successfully');
      debug &&
        console.log(`  Configuration tx: ${configResult.transactionHash}`);
    } else {
      debug && console.log('  Skipping treasury configuration as requested');
    }

    return {
      treasuryAddress: deployResult.address,
      transactionHash: deployResult.transactionHash,
      success: true,
    };
  } catch (error) {
    const { errorType, friendlyMessage } = categorizeError(error);
    console.error(
      `  Failed to deploy treasury contract for campaign ${campaignId}:`,
    );
    console.error(`  Error Type: ${errorType}`);
    console.error(`  Details: ${friendlyMessage}`);

    return {
      treasuryAddress: '',
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: errorType as
        | 'INSUFFICIENT_FUNDS'
        | 'GAS_LIMIT'
        | 'NETWORK_ERROR'
        | 'CONTRACT_ERROR'
        | 'UNKNOWN',
    };
  }
}

/**
 * Deploy both campaign and treasury contracts for a campaign
 * @param campaignData Campaign data for deployment
 * @param isDummy If true, bypasses blockchain interactions and returns mock data
 */
export async function deployAllContracts(
  campaignData: CampaignData,
  db: { campaign: { update: (args: { where: { id: number }, data: { startTime: Date; endTime: Date } }) => Promise<unknown> } },
  isDummy: boolean = false,
  skipTreasuryConfig: boolean = false,
): Promise<{
  campaignContract: CampaignContractDeployment;
  treasuryContract?: TreasuryContractDeployment;
}> {
  console.log(`Deploying all contracts for: ${campaignData.title}`);

  // Deploy campaign contract first
  const campaignContract = await deployCampaignContract(
    campaignData,
    db,
    isDummy,
  );

  if (!campaignContract.success) {
    debug &&
      console.log(
        `  Skipping treasury deployment due to campaign contract failure`,
      );
    return { campaignContract };
  }

  // Add delay after campaign deployment to ensure transaction is processed
  if (!isDummy) {
    debug && console.log('  Waiting 2 seconds before treasury deployment...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Deploy treasury contract
  const treasuryContract = await deployTreasuryContract(
    campaignData.id,
    campaignContract.campaignAddress,
    isDummy,
    skipTreasuryConfig,
  );

  return {
    campaignContract,
    treasuryContract,
  };
}
