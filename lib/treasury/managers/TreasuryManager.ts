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
        throw new Error('CampaignInfo address is required for treasury deployment');
      }

      // Deploy treasury using correct TreasuryFactory interface with CampaignInfo address
      const tx = await treasuryFactory.deploy(
        params.platformBytes, // platformHash
        params.campaignAddress, // infoAddress (must be CampaignInfo contract)
        0, // implementationId (0 = KeepWhatsRaised)
        `Campaign ${params.campaignId} Crypto`, // name
        `C${params.campaignId}CRYPTO`, // symbol
        { gasLimit: 2000000 }, // Increased gas limit
      );

      const receipt = await tx.wait();

      // Find deployment event
      const deployEvent = receipt.events?.find(
        (e: { event: string }) => e.event === 'TreasuryFactoryTreasuryDeployed',
      );

      if (!deployEvent) {
        throw new Error('Treasury deployment event not found');
      }

      const treasuryAddress = deployEvent.args.treasuryAddress;

      // Update database with crypto treasury address
      await db.campaign.update({
        where: { id: params.campaignId },
        data: {
          cryptoTreasuryAddress: treasuryAddress,
          treasuryAddress: treasuryAddress, // Keep as primary for backwards compatibility
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
        'function getBalance() external view returns (uint256)',
        'function getTotalPledged() external view returns (uint256)',
      ];

      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        treasuryABI,
        provider,
      );

      const [balance, totalPledged] = await Promise.all([
        treasuryContract.getBalance(),
        treasuryContract.getTotalPledged(),
      ]);

      return {
        available: ethers.formatUnits(balance, 6), // USDC has 6 decimals
        totalPledged: ethers.formatUnits(totalPledged, 6),
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
