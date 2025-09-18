/**
 * Contract deployment utilities for seed script
 * Allows automatic deployment of campaign and treasury contracts during seeding
 */

import { config } from 'dotenv';
import { ethers } from 'ethers';
import { chainConfig } from '@/lib/web3';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { createTreasuryManager } from '@/lib/treasury/interface';

// Load environment variables
config({ path: '.env.local' });

interface CampaignContractDeployment {
  campaignAddress: string;
  transactionHash: string;
  success: boolean;
  error?: string;
}

interface TreasuryContractDeployment {
  treasuryAddress: string;
  transactionHash: string;
  success: boolean;
  error?: string;
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
 */
export async function deployCampaignContract(
  campaignData: CampaignData,
): Promise<CampaignContractDeployment> {
  try {
    console.log(`🚀 Deploying campaign contract for: ${campaignData.title}`);

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
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
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
      flatFee: process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0.001',
      cumulativeFlatFee: process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0.002',
      platformFeeBps: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '400'),
      vakiCommissionBps: parseInt(process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS || '100'),
      launchOffsetSec: parseInt(process.env.NEXT_PUBLIC_LAUNCH_OFFSET_SEC || '3600'),
      minCampaignDurationSec: parseInt(process.env.NEXT_PUBLIC_MIN_CAMPAIGN_DURATION_SEC || '86400'),
    };

    // Prepare campaign timing
    const providedLaunchTime = Math.floor(campaignData.startTime.getTime() / 1000);
    const providedDeadline = Math.floor(campaignData.endTime.getTime() / 1000);

    const latestBlock = await provider.getBlock('latest');
    const blockchainNow = Number(latestBlock?.timestamp ?? Math.floor(Date.now() / 1000));

    const launchTime = Math.max(providedLaunchTime, blockchainNow + platformConfig.launchOffsetSec);
    const deadline = Math.max(providedDeadline, launchTime + platformConfig.minCampaignDurationSec);

    const goalAmount = ethers.parseUnits(String(campaignData.fundingGoal || '0'), usdcDecimals);

    // Generate unique campaign identifier
    const uniqueSuffix = `${campaignData.creatorAddress.slice(2, 8)}-${campaignData.id}-${Date.now()}`;
    const identifierHash = ethers.keccak256(ethers.toUtf8Bytes(`AKASHIC-SEED-${uniqueSuffix}`));

    // Configure fee structure
    const feeKeys = ['flatFee', 'cumulativeFlatFee', 'platformFee', 'vakiCommission'];
    const platformDataKeys = feeKeys.map((n) => ethers.keccak256(ethers.toUtf8Bytes(n)));

    const flatFee = ethers.parseUnits(platformConfig.flatFee, usdcDecimals);
    const cumulativeFlatFee = ethers.parseUnits(platformConfig.cumulativeFlatFee, usdcDecimals);

    const toBytes32 = (n: bigint | number) => `0x${BigInt(n).toString(16).padStart(64, '0')}`;
    const platformDataValues = [
      toBytes32(flatFee),
      toBytes32(cumulativeFlatFee),
      toBytes32(platformConfig.platformFeeBps),
      toBytes32(platformConfig.vakiCommissionBps),
    ];

    const campaignDataArray = [launchTime, deadline, goalAmount] as const;

    // Deploy campaign contract
    console.log('  📋 Submitting contract deployment transaction...');
    const tx = await factory.createCampaign(
      campaignData.creatorAddress,
      identifierHash,
      [globalPlatformHash],
      platformDataKeys,
      platformDataValues,
      campaignDataArray,
    );

    console.log('  ⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();

    // Extract campaign address from factory event logs (using same logic as working admin endpoint)
    let campaignAddress: string | null = null;
    try {
      const eventTopic = ethers.id('CampaignInfoFactoryCampaignCreated(bytes32,address)');
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
    } catch (parseError) {
      console.warn('  ⚠️ Could not parse event logs:', parseError);
    }

    if (!campaignAddress) {
      throw new Error('Failed to extract campaign address from transaction receipt');
    }

    console.log(`  ✅ Campaign contract deployed at: ${campaignAddress}`);
    console.log(`  📋 Transaction hash: ${receipt.hash}`);

    return {
      campaignAddress,
      transactionHash: receipt.hash,
      success: true,
    };

  } catch (error) {
    console.error(`  ❌ Failed to deploy campaign contract for ${campaignData.title}:`, error);
    return {
      campaignAddress: '',
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deploy a treasury contract using TreasuryManager
 */
export async function deployTreasuryContract(
  campaignId: number,
  campaignAddress: string,
): Promise<TreasuryContractDeployment> {
  try {
    console.log(`🏦 Deploying treasury contract for campaign ${campaignId}`);

    const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;
    const platformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;

    if (!platformAdminKey || !platformHash) {
      const missingVars = [];
      if (!platformAdminKey) missingVars.push('PLATFORM_ADMIN_PRIVATE_KEY');
      if (!platformHash) missingVars.push('NEXT_PUBLIC_PLATFORM_HASH');
      throw new Error(`Missing required environment variables for treasury deployment: ${missingVars.join(', ')}`);
    }

    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    const platformAdminSigner = new ethers.Wallet(platformAdminKey, provider);

    const treasuryManager = await createTreasuryManager();

    console.log('  📋 Deploying treasury via TreasuryManager...');
    const deployResult = await treasuryManager.deploy({
      campaignId,
      platformBytes: platformHash,
      campaignAddress,
      signer: platformAdminSigner,
    });

    if (deployResult.deploymentStatus !== 'success') {
      throw new Error(`Treasury deployment failed: ${deployResult.error}`);
    }

    console.log(`  ✅ Treasury contract deployed at: ${deployResult.address}`);
    console.log(`  📋 Transaction hash: ${deployResult.transactionHash}`);

    // Configure treasury with campaign parameters
    console.log('  ⚙️ Configuring treasury...');
    const configResult = await treasuryManager.configureTreasury(
      deployResult.address,
      campaignId,
      platformAdminSigner,
    );

    if (!configResult.success) {
      console.warn('  ⚠️ Treasury configuration failed:', configResult.error);
      // Continue anyway - treasury can be configured later
    } else {
      console.log('  ✅ Treasury configured successfully');
    }

    return {
      treasuryAddress: deployResult.address,
      transactionHash: deployResult.transactionHash,
      success: true,
    };

  } catch (error) {
    console.error(`  ❌ Failed to deploy treasury contract for campaign ${campaignId}:`, error);
    return {
      treasuryAddress: '',
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deploy both campaign and treasury contracts for a campaign
 */
export async function deployAllContracts(
  campaignData: CampaignData,
): Promise<{
  campaignContract: CampaignContractDeployment;
  treasuryContract?: TreasuryContractDeployment;
}> {
  console.log(`🚀 Deploying all contracts for: ${campaignData.title}`);

  // Deploy campaign contract first
  const campaignContract = await deployCampaignContract(campaignData);
  
  if (!campaignContract.success) {
    console.log(`  ❌ Skipping treasury deployment due to campaign contract failure`);
    return { campaignContract };
  }

  // Deploy treasury contract
  const treasuryContract = await deployTreasuryContract(
    campaignData.id,
    campaignContract.campaignAddress,
  );

  return {
    campaignContract,
    treasuryContract,
  };
}
