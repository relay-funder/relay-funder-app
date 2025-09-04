import { ethers } from 'ethers';
import { db } from '@/server/db';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { chainConfig } from '@/lib/web3';
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

      // CRITICAL: Validate that campaignAddress is a deployed CampaignInfo contract
      if (!params.campaignAddress) {
        throw new Error(
          'CampaignInfo address is required for treasury deployment',
        );
      }

      // Deploy treasury using correct TreasuryFactory interface with CampaignInfo address
      const tx = await treasuryFactory.deploy(
        params.platformBytes, // platformHash
        params.campaignAddress, // infoAddress (must be CampaignInfo contract)
        0, // implementationId (0 = KeepWhatsRaised)
        'RelayTreasury', // TODO: pass through campaign name
        'RLY', // TODO: pass through campaign symbol
        { gasLimit: 2000000 }, // Increased gas limit
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
        if (log.topics && log.topics[0] === expectedTopic) {
          // Extract address from data
          if (log.data) {
            // Remove zero padding from the beginning to get clean address
            const cleanData = log.data.replace(/^0x0{24}/, '0x');
            if (cleanData.length === 42 && cleanData.startsWith('0x')) {
              // Valid address format
              treasuryAddress = cleanData;
              break;
            }
          }
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

      const treasuryABI = [
        'function configureTreasury((uint256,uint256,uint256,uint256,bool),(uint256,uint256,uint256),(bytes32,bytes32,bytes32[])) external',
      ];

      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        treasuryABI,
        signer,
      );

      // Treasury configuration parameters
      const WITHDRAWAL_DELAY = 3600; // 1 hour
      const REFUND_DELAY = 7200; // 2 hours
      const CONFIG_LOCK_PERIOD = 1800; // 30 minutes
      const IS_COLOMBIAN = false;

      // Minimum withdrawal for fee exemption (0.5 USDC)
      const usdcDecimals = 6; // USDC has 6 decimals
      const MIN_WITHDRAWAL_FEE_EXEMPTION = ethers.parseUnits(
        '0.5',
        usdcDecimals,
      ); // 0.5 USDC threshold

      // Fee keys as per shell script
      const FLAT_FEE_KEY = ethers.keccak256(ethers.toUtf8Bytes('flatFee'));
      const CUM_FLAT_FEE_KEY = ethers.keccak256(
        ethers.toUtf8Bytes('cumulativeFlatFee'),
      );
      const PLATFORM_FEE_KEY = ethers.keccak256(
        ethers.toUtf8Bytes('platformFee'),
      );
      const VAKI_COMMISSION_KEY = ethers.keccak256(
        ethers.toUtf8Bytes('vakiCommission'),
      );

      const launchTime = Math.floor(
        new Date(campaign.startTime).getTime() / 1000,
      );
      const deadline = Math.floor(new Date(campaign.endTime).getTime() / 1000);
      const goalAmount = ethers.parseUnits(campaign.fundingGoal, 6); // USDC has 6 decimals

      const tx = await treasuryContract.configureTreasury(
        [
          MIN_WITHDRAWAL_FEE_EXEMPTION,
          WITHDRAWAL_DELAY,
          REFUND_DELAY,
          CONFIG_LOCK_PERIOD,
          IS_COLOMBIAN,
        ],
        [launchTime, deadline, goalAmount],
        [
          FLAT_FEE_KEY,
          CUM_FLAT_FEE_KEY,
          [PLATFORM_FEE_KEY, VAKI_COMMISSION_KEY],
        ],
        { gasLimit: 1000000 },
      );

      await tx.wait();

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
   */
  async withdraw(params: WithdrawalParams): Promise<WithdrawalResult> {
    try {
      // Initialize treasury contract with withdrawal ABI
      const treasuryABI = [
        'function withdraw(uint256 amount) external',
        'function getBalance() external view returns (uint256)',
      ];

      const treasuryContract = new ethers.Contract(
        params.treasuryAddress,
        treasuryABI,
        params.signer,
      );

      const amountWei = ethers.parseUnits(params.amount, 6); // USDC has 6 decimals
      const tx = await treasuryContract.withdraw(amountWei);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        amount: params.amount,
        recipient: params.recipient,
      };
    } catch (error) {
      console.error('CryptoTreasuryManager withdrawal error:', error);
      return {
        success: false,
        amount: params.amount,
        recipient: params.recipient,
        error:
          error instanceof Error ? error.message : 'Unknown withdrawal error',
      };
    }
  }

  /**
   * Get balance information from the crypto treasury
   */
  async getBalance(treasuryAddress: string): Promise<TreasuryBalance> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const treasuryABI = [
        'function getRaisedAmount() external view returns (uint256)',
        'function getAvailableRaisedAmount() external view returns (uint256)',
      ];

      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        treasuryABI,
        provider,
      );

      const [totalRaised, availableAmount] = await Promise.all([
        treasuryContract.getRaisedAmount(),
        treasuryContract.getAvailableRaisedAmount(),
      ]);

      return {
        available: ethers.formatUnits(availableAmount, 6), // USDC has 6 decimals
        totalPledged: ethers.formatUnits(totalRaised, 6),
        currency: 'USDC',
      };
    } catch (error) {
      console.error('Error getting crypto treasury balance:', error);
      return {
        available: '0',
        totalPledged: '0',
        currency: 'USDC',
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
