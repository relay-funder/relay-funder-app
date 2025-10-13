import { ethers } from 'ethers';
import { db } from '@/server/db';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { chainConfig } from '@/lib/web3';
import { debugWeb3 as debug } from '@/lib/debug';
import {
  TREASURY_DELAYS,
  TREASURY_CONFIG,
  TREASURY_GAS_LIMITS,
  USD_CONFIG,
  TREASURY_IMPLEMENTATIONS,
  FEE_KEYS,
} from '@/lib/constant/treasury';
import {
  TreasuryInterface,
  TreasuryDeploymentResult,
  TreasuryDeploymentParams,
  PaymentProcessingResult,
  PaymentProcessingParams,
  WithdrawalResult,
  WithdrawalParams,
  TreasuryBalance,
  TreasuryConfigurationResult,
} from '../interface';
import { USD_TOKEN } from '@/lib/constant';

/**
 * Treasury manager for KeepWhat'sRaised contracts
 * Single treasury implementation for crypto payments
 */
export class TreasuryManager extends TreasuryInterface {
  private readonly treasuryFactoryAddress: string;
  private readonly globalParamsAddress: string;
  private readonly platformBytes: string;
  private readonly rpcUrl: string;

  constructor() {
    super();
    this.treasuryFactoryAddress = process.env
      .NEXT_PUBLIC_TREASURY_FACTORY as string;
    this.globalParamsAddress = process.env.NEXT_PUBLIC_GLOBAL_PARAMS as string;
    this.platformBytes = process.env.NEXT_PUBLIC_PLATFORM_HASH as string;
    this.rpcUrl = chainConfig.rpcUrl as string;

    if (
      !this.treasuryFactoryAddress ||
      !this.globalParamsAddress ||
      !this.platformBytes
    ) {
      throw new Error(
        'Missing required environment variables for CryptoTreasuryManager',
      );
    }
  }

  /**
   * Deploy a KeepWhatsRaised treasury contract
   */
  async deploy(
    params: TreasuryDeploymentParams,
  ): Promise<TreasuryDeploymentResult> {
    try {
      // Initialize TreasuryFactory contract
      const treasuryFactory = new ethers.Contract(
        this.treasuryFactoryAddress,
        TreasuryFactoryABI,
        params.signer,
      );

      // Validate that campaignAddress is a deployed CampaignInfo contract
      if (!params.campaignAddress) {
        throw new Error(
          'CampaignInfo address is required for treasury deployment',
        );
      }

      // Deploy treasury using correct TreasuryFactory interface with CampaignInfo address
      const tx = await treasuryFactory.deploy(
        params.platformBytes, // platformHash
        params.campaignAddress, // infoAddress (must be CampaignInfo contract)
        TREASURY_IMPLEMENTATIONS.KEEP_WHATS_RAISED, // implementationId
        'RelayTreasury', // TODO: pass through campaign name
        'RLY', // TODO: pass through campaign symbol
        { gasLimit: TREASURY_GAS_LIMITS.DEPLOY },
      );

      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error(
          `Treasury deployment transaction failed with status: ${receipt.status}`,
        );
      }

      // Extract treasury address from event logs using topic signature
      let treasuryAddress = null;
      // Compute the topic hash from the event signature instead of hardcoding
      const expectedTopic = ethers.id(
        'TreasuryFactoryTreasuryDeployed(bytes32,uint256,address,address)',
      );

      for (const log of receipt.logs || []) {
        if (!log.topics || log.topics[0] !== expectedTopic) {
          continue;
        }

        if (!log.data) {
          continue;
        }

        // Remove zero padding from the beginning to get clean address
        const cleanData = log.data.replace(/^0x0{24}/, '0x');
        if (cleanData.length === 42 && cleanData.startsWith('0x')) {
          // Valid address format
          treasuryAddress = cleanData;
          break;
        }
      }

      if (!treasuryAddress) {
        throw new Error(
          'Treasury deployment event not found or could not extract treasury address',
        );
      }

      // Update database with treasury address
      await db.campaign.update({
        where: { id: params.campaignId },
        data: {
          treasuryAddress: treasuryAddress,
        },
      });

      return {
        address: treasuryAddress,
        transactionHash: tx.hash,
        deploymentStatus: 'success',
      };
    } catch (error) {
      console.error('CryptoTreasuryManager deployment error:', error);
      return {
        address: '',
        transactionHash: '',
        deploymentStatus: 'failed',
        error:
          error instanceof Error ? error.message : 'Unknown deployment error',
      };
    }
  }

  /**
   * Get the treasury address for a campaign
   */
  async getAddress(campaignId: number): Promise<string | null> {
    try {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: { treasuryAddress: true },
      });

      return campaign?.treasuryAddress || null;
    } catch (error) {
      console.error('Error getting treasury address:', error);
      return null;
    }
  }

  /**
   * Configure treasury with campaign timing and fee parameters
   */
  async configureTreasury(
    treasuryAddress: string,
    campaignId: number,
    signer: ethers.Signer,
  ): Promise<TreasuryConfigurationResult> {
    try {
      // Get campaign details for configuration
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          startTime: true,
          endTime: true,
          fundingGoal: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Validate campaign data before configuration
      if (!campaign.startTime) {
        throw new Error('Campaign startTime is not set');
      }
      if (!campaign.endTime) {
        throw new Error('Campaign endTime is not set');
      }
      if (!campaign.fundingGoal || campaign.fundingGoal === '0') {
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
        new Date(campaign.startTime).getTime() / 1000,
      );
      const deadline = Math.floor(new Date(campaign.endTime).getTime() / 1000);
      const goalAmount = ethers.parseUnits(
        campaign.fundingGoal,
        USD_CONFIG.DECIMALS,
      );

      // Validate converted timestamps
      if (isNaN(launchTime) || launchTime <= 0) {
        throw new Error(
          `Invalid launchTime: ${campaign.startTime} converted to ${launchTime}`,
        );
      }
      if (isNaN(deadline) || deadline <= 0) {
        throw new Error(
          `Invalid deadline: ${campaign.endTime} converted to ${deadline}`,
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
          `  Goal Amount: ${goalAmount.toString()} (${campaign.fundingGoal} USD)`,
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
      debug && console.log('  Waiting 5 seconds before configuration...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check if treasury is already configured
      debug && console.log('  Checking if treasury is already configured...');
      const currentLaunchTime = await treasuryContract.getLaunchTime();
      if (currentLaunchTime > 0) {
        debug &&
          console.log(
            '  Treasury is already configured, skipping configuration',
          );
        return {
          success: true,
          transactionHash: '',
        };
      }

      debug && console.log('  Configuring treasury...');

      const tx = await treasuryContract.configureTreasury(
        configStruct,
        campaignDataStruct,
        feeKeysStruct,
        feeValuesStruct,
        {
          gasLimit: TREASURY_GAS_LIMITS.CONFIGURE,
        },
      );

      debug && console.log(`  Transaction submitted: ${tx.hash}`);
      debug && console.log(`  Transaction data: ${tx.data}`);

      try {
        const receipt = await tx.wait();
        debug &&
          console.log(
            `  Transaction confirmed in block: ${receipt?.blockNumber}`,
          );

        return {
          success: true,
          transactionHash: tx.hash,
        };
      } catch (waitError: unknown) {
        console.error('  Transaction wait error:', waitError);
        throw waitError;
      }
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
  }

  /**
   * Process a payment through the KeepWhatsRaised treasury
   */
  async processPayment(
    params: PaymentProcessingParams,
  ): Promise<PaymentProcessingResult> {
    try {
      if (!params.signer) {
        throw new Error('Signer required for crypto payments');
      }

      // This method would typically be called from the existing donation flow
      // The actual transaction is handled by request-transaction.ts
      // This manager provides the interface abstraction layer

      return {
        success: true,
        paymentId: params.transactionId,
      };
    } catch (error) {
      console.error('CryptoTreasuryManager payment processing error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown payment processing error',
      };
    }
  }

  /**
   * Withdraw funds from the crypto treasury
   *
   * IMPORTANT: For partial withdrawals (before deadline), flat fees are ADDED to the
   * withdrawal amount when deducting from available balance. This means:
   * - If available = 100 and fee = 2, max withdrawal = 98 (not 100)
   * - totalDeducted = withdrawalAmount + fee <= available
   *
   * The withdrawal amount passed should already account for fees if withdrawing
   * the maximum available amount.
   */
  async withdraw(params: WithdrawalParams): Promise<WithdrawalResult> {
    try {
      // Use the full ABI from contracts/abi/KeepWhatsRaised.ts
      const treasuryContract = new ethers.Contract(
        params.treasuryAddress,
        KeepWhatsRaisedABI,
        params.signer,
      );

      const amountWei = ethers.parseUnits(params.amount, USD_CONFIG.DECIMALS);

      debug && console.log('Withdrawal parameters:');
      debug && console.log(`  Treasury: ${params.treasuryAddress}`);
      debug &&
        console.log(
          `  Amount: ${params.amount} USD (${amountWei.toString()} wei)`,
        );
      debug && console.log(`  Recipient: ${params.recipient}`);
      debug &&
        console.log(
          '  Note: Amount should already account for withdrawal fees',
        );

      const tx = await treasuryContract.withdraw(amountWei, {
        gasLimit: TREASURY_GAS_LIMITS.WITHDRAW,
      });

      debug && console.log(`  Transaction hash: ${tx.hash}`);
      debug && console.log('  Waiting for confirmation...');

      const receipt = await tx.wait();

      debug &&
        console.log(`  Withdrawal confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: tx.hash,
        amount: params.amount,
        recipient: params.recipient,
      };
    } catch (error) {
      console.error('CryptoTreasuryManager withdrawal error:', error);

      // Provide more helpful error message for common issues
      let errorMessage = 'Unknown withdrawal error';
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for common withdrawal errors
        if (
          errorMessage.includes('insufficient') ||
          errorMessage.includes('exceeds')
        ) {
          errorMessage =
            'Withdrawal amount exceeds available balance after fees. Try withdrawing a smaller amount.';
        } else if (
          errorMessage.includes('not approved') ||
          errorMessage.includes('approval')
        ) {
          errorMessage =
            'Withdrawal not approved. Platform admin must approve withdrawals first.';
        } else if (
          errorMessage.includes('deadline') ||
          errorMessage.includes('time')
        ) {
          errorMessage =
            'Withdrawal window has closed or campaign has not ended yet.';
        }
      }

      return {
        success: false,
        amount: params.amount,
        recipient: params.recipient,
        error: errorMessage,
      };
    }
  }

  /**
   * Get balance information from the crypto treasury
   */
  async getBalance(treasuryAddress: string): Promise<TreasuryBalance> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);

      // Use the full ABI from contracts/abi/KeepWhatsRaised.ts
      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        KeepWhatsRaisedABI,
        provider,
      );

      const [totalRaised, availableAmount] = await Promise.all([
        treasuryContract.getRaisedAmount(),
        treasuryContract.getAvailableRaisedAmount(),
      ]);

      return {
        available: ethers.formatUnits(availableAmount, USD_CONFIG.DECIMALS),
        totalPledged: ethers.formatUnits(totalRaised, USD_CONFIG.DECIMALS),
        currency: USD_TOKEN,
      };
    } catch (error) {
      console.error('Error getting crypto treasury balance:', error);
      return {
        available: '0',
        totalPledged: '0',
        currency: USD_TOKEN,
      };
    }
  }

  /**
   * Validate crypto treasury deployment status
   */
  async validateDeployment(treasuryAddress: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const code = await provider.getCode(treasuryAddress);
      return code !== '0x'; // Contract exists if bytecode is not empty
    } catch (error) {
      console.error('Error validating crypto treasury deployment:', error);
      return false;
    }
  }
}
