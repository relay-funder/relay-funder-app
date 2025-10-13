import { useCallback } from 'react';
import { ethers } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { useConnectorClient } from '@/lib/web3';
import { debugHook as debug } from '@/lib/debug';
import {
  TREASURY_DELAYS,
  TREASURY_CONFIG,
  TREASURY_GAS_LIMITS,
  USD_CONFIG,
  FEE_KEYS,
} from '@/lib/constant/treasury';

export interface CampaignData {
  startTime: Date;
  endTime: Date;
  fundingGoal: string;
}

export interface TreasuryConfigurationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function useAdminConfigureTreasury() {
  const { data: client } = useConnectorClient();

  const configureTreasury = useCallback(
    async (
      treasuryAddress: string,
      campaignId: number,
      campaignData: CampaignData,
    ): Promise<TreasuryConfigurationResult> => {
      if (!client) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(client);
        const signer = await ethersProvider.getSigner();

        // Validate campaign data
        if (!campaignData.startTime) {
          throw new Error('Campaign startTime is not set');
        }
        if (!campaignData.endTime) {
          throw new Error('Campaign endTime is not set');
        }
        if (!campaignData.fundingGoal || campaignData.fundingGoal === '0') {
          throw new Error('Campaign fundingGoal is not set or is zero');
        }

        // Use the full ABI from contracts/abi/KeepWhatsRaised.ts
        const treasuryContract = new ethers.Contract(
          treasuryAddress,
          KeepWhatsRaisedABI,
          signer,
        );

        // Config struct
        const MIN_WITHDRAWAL_FEE_EXEMPTION = ethers.parseUnits(
          USD_CONFIG.MIN_WITHDRAWAL_FEE_EXEMPTION,
          USD_CONFIG.DECIMALS,
        );

        // Fee keys
        const FLAT_FEE_KEY = ethers.keccak256(
          ethers.toUtf8Bytes(FEE_KEYS.FLAT_FEE),
        );
        const CUM_FLAT_FEE_KEY = ethers.keccak256(
          ethers.toUtf8Bytes(FEE_KEYS.CUMULATIVE_FLAT_FEE),
        );
        const PLATFORM_FEE_KEY = ethers.keccak256(
          ethers.toUtf8Bytes(FEE_KEYS.PLATFORM_FEE),
        );
        const VAKI_COMMISSION_KEY = ethers.keccak256(
          ethers.toUtf8Bytes(FEE_KEYS.VAKI_COMMISSION),
        );

        // Fee values
        const FLAT_FEE_VALUE = ethers.parseUnits(
          process.env.NEXT_PUBLIC_PLATFORM_FLAT_FEE || '0',
          USD_CONFIG.DECIMALS,
        );
        const CUM_FLAT_FEE_VALUE = ethers.parseUnits(
          process.env.NEXT_PUBLIC_PLATFORM_CUMULATIVE_FLAT_FEE || '0',
          USD_CONFIG.DECIMALS,
        );
        const PLATFORM_FEE_BPS = parseInt(
          process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '0',
        ); // 0%
        const VAKI_COMMISSION_BPS = parseInt(
          process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS || '0',
        ); // 0%

        // Campaign data - convert to Unix timestamps
        const launchTime = Math.floor(
          new Date(campaignData.startTime).getTime() / 1000,
        );
        const deadline = Math.floor(
          new Date(campaignData.endTime).getTime() / 1000,
        );
        const goalAmount = ethers.parseUnits(
          campaignData.fundingGoal,
          USD_CONFIG.DECIMALS,
        );

        // Validate converted timestamps
        if (isNaN(launchTime) || launchTime <= 0) {
          throw new Error(
            `Invalid launchTime: ${campaignData.startTime} converted to ${launchTime}`,
          );
        }
        if (isNaN(deadline) || deadline <= 0) {
          throw new Error(
            `Invalid deadline: ${campaignData.endTime} converted to ${deadline}`,
          );
        }
        if (deadline <= launchTime) {
          throw new Error(
            `Campaign deadline (${deadline}) must be after launch time (${launchTime})`,
          );
        }

        debug && console.log('Treasury configuration parameters:');
        debug &&
          console.log(
            `  Launch Time: ${launchTime} (${new Date(launchTime * 1000).toISOString()})`,
          );
        debug &&
          console.log(
            `  Deadline: ${deadline} (${new Date(deadline * 1000).toISOString()})`,
          );
        debug &&
          console.log(
            `  Goal Amount: ${goalAmount.toString()} (${campaignData.fundingGoal} USD)`,
          );

        // Build structs as objects with named fields (required for ethers.js JSON ABI)
        const configStruct = {
          minimumWithdrawalForFeeExemption: MIN_WITHDRAWAL_FEE_EXEMPTION,
          withdrawalDelay: TREASURY_DELAYS.WITHDRAWAL_DELAY,
          refundDelay: TREASURY_DELAYS.REFUND_DELAY,
          configLockPeriod: TREASURY_DELAYS.CONFIG_LOCK_PERIOD,
          isColombianCreator: TREASURY_CONFIG.IS_COLOMBIAN,
        };

        const campaignDataStruct = {
          launchTime,
          deadline,
          goalAmount,
        };

        const feeKeysStruct = {
          flatFeeKey: FLAT_FEE_KEY,
          cumulativeFlatFeeKey: CUM_FLAT_FEE_KEY,
          grossPercentageFeeKeys: [PLATFORM_FEE_KEY, VAKI_COMMISSION_KEY],
        };

        const feeValuesStruct = {
          flatFeeValue: FLAT_FEE_VALUE,
          cumulativeFlatFeeValue: CUM_FLAT_FEE_VALUE,
          grossPercentageFeeValues: [PLATFORM_FEE_BPS, VAKI_COMMISSION_BPS],
        };

        debug && console.log('Treasury fee configuration:');
        debug &&
          console.log(
            `  FLAT_FEE_VALUE: ${FLAT_FEE_VALUE.toString()} (${ethers.formatUnits(FLAT_FEE_VALUE, USD_CONFIG.DECIMALS)} USD)`,
          );
        debug &&
          console.log(
            `  CUM_FLAT_FEE_VALUE: ${CUM_FLAT_FEE_VALUE.toString()} (${ethers.formatUnits(CUM_FLAT_FEE_VALUE, USD_CONFIG.DECIMALS)} USD)`,
          );
        debug && console.log(`  PLATFORM_FEE_BPS: ${PLATFORM_FEE_BPS}`);
        debug && console.log(`  VAKI_COMMISSION_BPS: ${VAKI_COMMISSION_BPS}`);

        // Wait for deployment transaction to be processed
        debug && console.log('  Waiting 2 seconds before configuration...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get current nonce to ensure proper transaction ordering
        const nonce = await signer.getNonce('pending');
        debug && console.log(`  Using nonce: ${nonce}`);

        const tx = await treasuryContract.configureTreasury(
          configStruct,
          campaignDataStruct,
          feeKeysStruct,
          feeValuesStruct,
          {
            gasLimit: TREASURY_GAS_LIMITS.CONFIGURE,
            nonce,
            type: 0, // Use legacy transaction type (like shell script --legacy flag)
          },
        );

        debug && console.log(`  Transaction submitted: ${tx.hash}`);
        const receipt = await tx.wait();
        debug &&
          console.log(
            `  Transaction confirmed in block: ${receipt?.blockNumber}`,
          );

        return {
          success: true,
          transactionHash: tx.hash,
        };
      } catch (error) {
        console.error('Error configuring treasury:', error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unknown configuration error',
        };
      }
    },
    [client],
  );

  return { configureTreasury };
}
