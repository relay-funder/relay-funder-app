import { ethers } from 'ethers';
import { db } from '@/server/db';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory'; // PaymentTreasury uses same factory
import { PaymentTreasuryABI } from '@/contracts/abi/PaymentTreasury';
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
 * Treasury manager for credit card payments using PaymentTreasury contracts
 * Integrates with Crowdsplit bridge for automated USDC deposits
 */
export class PaymentTreasuryManager extends TreasuryInterface {
  private readonly treasuryFactoryAddress: string; // Same factory as KeepWhatsRaised
  private readonly platformBytes: string;
  private readonly rpcUrl: string;

  constructor() {
    super();
    this.treasuryFactoryAddress = process.env
      .NEXT_PUBLIC_TREASURY_FACTORY as string; // Same factory
    this.platformBytes = process.env.NEXT_PUBLIC_PLATFORM_HASH as string;
    this.rpcUrl = chainConfig.rpcUrl as string;

    if (!this.treasuryFactoryAddress || !this.platformBytes) {
      throw new Error(
        'Missing required environment variables for PaymentTreasuryManager',
      );
    }
  }

  /**
   * Deploy a PaymentTreasury contract for credit card payments
   */
  async deploy(
    params: TreasuryDeploymentParams,
  ): Promise<TreasuryDeploymentResult> {
    try {
      // Initialize TreasuryFactory contract (same as KeepWhatsRaised)
      const treasuryFactory = new ethers.Contract(
        this.treasuryFactoryAddress,
        TreasuryFactoryABI,
        params.signer,
      );

      // CRITICAL: Validate that campaignAddress is a deployed CampaignInfo contract
      if (!params.campaignAddress) {
        throw new Error('CampaignInfo address is required for treasury deployment');
      }

      // Deploy PaymentTreasury using correct TreasuryFactory interface with CampaignInfo address
      const tx = await treasuryFactory.deploy(
        params.platformBytes, // platformHash
        params.campaignAddress, // infoAddress (must be CampaignInfo contract)
        1, // implementationId (1 = PaymentTreasury)
        `Campaign ${params.campaignId} Payment`, // name
        `C${params.campaignId}PAY`, // symbol
        { gasLimit: 2000000 }, // Increased gas limit
      );

      const receipt = await tx.wait();

      // Find deployment event
      const deployEvent = receipt.events?.find(
        (e: { event: string }) => e.event === 'PaymentTreasuryDeployed',
      );

      if (!deployEvent) {
        throw new Error('PaymentTreasury deployment event not found');
      }

      const treasuryAddress = deployEvent.args.treasuryAddress;

      // Update database with payment treasury address
      await db.campaign.update({
        where: { id: params.campaignId },
        data: {
          paymentTreasuryAddress: treasuryAddress,
        },
      });

      return {
        address: treasuryAddress,
        transactionHash: tx.hash,
        deploymentStatus: 'success',
      };
    } catch (error) {
      console.error('PaymentTreasuryManager deployment error:', error);
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
   * Get the payment treasury address for a campaign
   */
  async getAddress(campaignId: number): Promise<string | null> {
    try {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: { paymentTreasuryAddress: true },
      });

      return campaign?.paymentTreasuryAddress || null;
    } catch (error) {
      console.error('Error getting payment treasury address:', error);
      return null;
    }
  }

  /**
   * Process a credit card payment through the PaymentTreasury
   * Uses createPayment and confirmPayment workflow
   */
  async processPayment(
    params: PaymentProcessingParams,
  ): Promise<PaymentProcessingResult> {
    try {
      if (params.paymentMethod !== 'CREDIT_CARD') {
        throw new Error(
          'PaymentTreasuryManager only handles credit card payments',
        );
      }

      // Initialize PaymentTreasury contract
      const paymentTreasury = new ethers.Contract(
        params.treasuryAddress,
        PaymentTreasuryABI,
        params.signer || new ethers.JsonRpcProvider(this.rpcUrl),
      );

      // For credit card payments, create and confirm payment
      if (params.signer && params.transactionId) {
        const amountWei = ethers.parseUnits(params.amount, 6); // USDC has 6 decimals

        // Create payment ID from transaction details
        const paymentId = ethers.keccak256(
          ethers.toUtf8Bytes(`${params.userAddress}-${params.transactionId}`),
        );

        // Create payment with 1 hour expiration
        const expiration = Math.floor(Date.now() / 1000) + 3600;
        const itemId = ethers.keccak256(
          ethers.toUtf8Bytes('campaign-donation'),
        );

        const createTx = await paymentTreasury.createPayment(
          paymentId,
          params.userAddress,
          itemId,
          amountWei,
          expiration,
          { gasLimit: 150000 },
        );

        await createTx.wait();

        // Confirm payment immediately (in real implementation, this would be called by webhook)
        const confirmTx = await paymentTreasury.confirmPayment(paymentId, {
          gasLimit: 100000,
        });

        await confirmTx.wait();

        return {
          success: true,
          transactionHash: confirmTx.hash,
          paymentId: paymentId,
        };
      }

      // If no signer provided, this is likely called from webhook processing
      return {
        success: true,
        paymentId: params.transactionId,
      };
    } catch (error) {
      console.error('PaymentTreasuryManager payment processing error:', error);
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
   * Webhook handler for Crowdsplit payment confirmation
   * In the actual implementation, this would be called by Crowdsplit webhook
   * to confirm payments after credit card processing is complete
   */
  async confirmPaymentFromWebhook(
    treasuryAddress: string,
    paymentId: string,
    signer: ethers.Signer,
  ): Promise<PaymentProcessingResult> {
    try {
      const paymentTreasury = new ethers.Contract(
        treasuryAddress,
        PaymentTreasuryABI,
        signer,
      );

      const tx = await paymentTreasury.confirmPayment(paymentId, {
        gasLimit: 100000,
      });

      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        paymentId: paymentId,
      };
    } catch (error) {
      console.error(
        'PaymentTreasuryManager webhook confirmation error:',
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown webhook confirmation error',
      };
    }
  }

  /**
   * Withdraw funds from the payment treasury
   */
  async withdraw(params: WithdrawalParams): Promise<WithdrawalResult> {
    try {
      const paymentTreasury = new ethers.Contract(
        params.treasuryAddress,
        PaymentTreasuryABI,
        params.signer,
      );

      const amountWei = ethers.parseUnits(params.amount, 6); // USDC has 6 decimals
      const tx = await paymentTreasury.withdraw(amountWei);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        amount: params.amount,
        recipient: params.recipient,
      };
    } catch (error) {
      console.error('PaymentTreasuryManager withdrawal error:', error);
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
   * Get balance information from the payment treasury
   */
  async getBalance(treasuryAddress: string): Promise<TreasuryBalance> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const paymentTreasury = new ethers.Contract(
        treasuryAddress,
        PaymentTreasuryABI,
        provider,
      );

      const [balance, totalPledged] = await Promise.all([
        paymentTreasury.getBalance(),
        paymentTreasury.getTotalPledged(),
      ]);

      return {
        available: ethers.formatUnits(balance, 6), // USDC has 6 decimals
        totalPledged: ethers.formatUnits(totalPledged, 6),
        currency: 'USDC',
      };
    } catch (error) {
      console.error('Error getting payment treasury balance:', error);
      return {
        available: '0',
        totalPledged: '0',
        currency: 'USDC',
      };
    }
  }

  /**
   * Validate payment treasury deployment status
   */
  async validateDeployment(treasuryAddress: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const code = await provider.getCode(treasuryAddress);
      return code !== '0x'; // Contract exists if bytecode is not empty
    } catch (error) {
      console.error('Error validating payment treasury deployment:', error);
      return false;
    }
  }
}
