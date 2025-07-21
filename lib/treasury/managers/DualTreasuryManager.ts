// import { ethers } from 'ethers'; // Not currently used but may be needed for future treasury operations
import { db } from '@/server/db';
import { CryptoTreasuryManager } from './CryptoTreasuryManager';
import { PaymentTreasuryManager } from './PaymentTreasuryManager';
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
 * Dual treasury manager that coordinates both crypto and payment treasuries
 * Provides unified interface for dual treasury operations during MVP testing
 */
export class DualTreasuryManager extends TreasuryInterface {
  private readonly cryptoTreasuryManager: CryptoTreasuryManager;
  private readonly paymentTreasuryManager: PaymentTreasuryManager;

  constructor() {
    super();
    this.cryptoTreasuryManager = new CryptoTreasuryManager();
    this.paymentTreasuryManager = new PaymentTreasuryManager();
  }

  /**
   * Deploy both treasury contracts sequentially
   * Deploys crypto treasury first, then payment treasury
   */
  async deploy(
    params: TreasuryDeploymentParams,
  ): Promise<TreasuryDeploymentResult> {
    try {
      // Update campaign to dual treasury mode
      await db.campaign.update({
        where: { id: params.campaignId },
        data: { treasuryMode: 'DUAL' },
      });

      // Deploy crypto treasury first
      console.log('Deploying crypto treasury for campaign:', params.campaignId);
      const cryptoResult = await this.cryptoTreasuryManager.deploy(params);

      if (cryptoResult.deploymentStatus === 'failed') {
        console.error('Crypto treasury deployment failed:', cryptoResult.error);
        return {
          address: '',
          transactionHash: '',
          deploymentStatus: 'failed',
          error: `Crypto treasury deployment failed: ${cryptoResult.error}`,
        };
      }

      // Deploy payment treasury second
      console.log(
        'Deploying payment treasury for campaign:',
        params.campaignId,
      );
      const paymentResult = await this.paymentTreasuryManager.deploy(params);

      if (paymentResult.deploymentStatus === 'failed') {
        console.error(
          'Payment treasury deployment failed:',
          paymentResult.error,
        );
        // Note: We could implement rollback logic here if needed
        return {
          address: cryptoResult.address, // Return crypto address as primary
          transactionHash: cryptoResult.transactionHash,
          deploymentStatus: 'failed',
          error: `Payment treasury deployment failed: ${paymentResult.error}. Crypto treasury deployed successfully.`,
        };
      }

      console.log(
        'Both treasuries deployed successfully for campaign:',
        params.campaignId,
      );

      return {
        address: cryptoResult.address, // Return crypto treasury as primary address
        transactionHash: `${cryptoResult.transactionHash},${paymentResult.transactionHash}`,
        deploymentStatus: 'success',
      };
    } catch (error) {
      console.error('DualTreasuryManager deployment error:', error);
      return {
        address: '',
        transactionHash: '',
        deploymentStatus: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown dual treasury deployment error',
      };
    }
  }

  /**
   * Get treasury address based on payment method
   * Returns crypto treasury for CRYPTO payments, payment treasury for CREDIT_CARD
   */
  async getAddress(
    campaignId: number,
    paymentMethod?: 'CRYPTO' | 'CREDIT_CARD',
  ): Promise<string | null> {
    try {
      if (paymentMethod === 'CREDIT_CARD') {
        return await this.paymentTreasuryManager.getAddress(campaignId);
      } else {
        // Default to crypto treasury for backward compatibility
        return await this.cryptoTreasuryManager.getAddress(campaignId);
      }
    } catch (error) {
      console.error('Error getting dual treasury address:', error);
      return null;
    }
  }

  /**
   * Process payment through appropriate treasury based on payment method
   */
  async processPayment(
    params: PaymentProcessingParams,
  ): Promise<PaymentProcessingResult> {
    try {
      if (params.paymentMethod === 'CREDIT_CARD') {
        return await this.paymentTreasuryManager.processPayment(params);
      } else {
        return await this.cryptoTreasuryManager.processPayment(params);
      }
    } catch (error) {
      console.error('DualTreasuryManager payment processing error:', error);
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
   * Withdraw from specified treasury address
   * Determines treasury type based on address and routes accordingly
   */
  async withdraw(params: WithdrawalParams): Promise<WithdrawalResult> {
    try {
      // Determine which treasury type based on the address
      const campaignId = await this.getCampaignIdFromTreasuryAddress(
        params.treasuryAddress,
      );
      if (!campaignId) {
        throw new Error('Cannot determine campaign for treasury address');
      }

      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          cryptoTreasuryAddress: true,
          paymentTreasuryAddress: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.paymentTreasuryAddress === params.treasuryAddress) {
        return await this.paymentTreasuryManager.withdraw(params);
      } else if (campaign.cryptoTreasuryAddress === params.treasuryAddress) {
        return await this.cryptoTreasuryManager.withdraw(params);
      } else {
        throw new Error(
          'Treasury address does not match any deployed treasuries',
        );
      }
    } catch (error) {
      console.error('DualTreasuryManager withdrawal error:', error);
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
   * Get combined balance from both treasuries
   */
  async getBalance(treasuryAddress: string): Promise<TreasuryBalance> {
    try {
      // Determine which treasury type and get its balance
      const campaignId =
        await this.getCampaignIdFromTreasuryAddress(treasuryAddress);
      if (!campaignId) {
        throw new Error('Cannot determine campaign for treasury address');
      }

      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          cryptoTreasuryAddress: true,
          paymentTreasuryAddress: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.paymentTreasuryAddress === treasuryAddress) {
        return await this.paymentTreasuryManager.getBalance(treasuryAddress);
      } else if (campaign.cryptoTreasuryAddress === treasuryAddress) {
        return await this.cryptoTreasuryManager.getBalance(treasuryAddress);
      } else {
        throw new Error(
          'Treasury address does not match any deployed treasuries',
        );
      }
    } catch (error) {
      console.error('Error getting dual treasury balance:', error);
      return {
        available: '0',
        totalPledged: '0',
        currency: 'USDC',
      };
    }
  }

  /**
   * Get combined balance from both treasuries for a campaign
   */
  async getCombinedBalance(campaignId: number): Promise<TreasuryBalance> {
    try {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          cryptoTreasuryAddress: true,
          paymentTreasuryAddress: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const balances = await Promise.allSettled([
        campaign.cryptoTreasuryAddress
          ? this.cryptoTreasuryManager.getBalance(
              campaign.cryptoTreasuryAddress,
            )
          : Promise.resolve({
              available: '0',
              totalPledged: '0',
              currency: 'USDC',
            }),
        campaign.paymentTreasuryAddress
          ? this.paymentTreasuryManager.getBalance(
              campaign.paymentTreasuryAddress,
            )
          : Promise.resolve({
              available: '0',
              totalPledged: '0',
              currency: 'USDC',
            }),
      ]);

      const cryptoBalance =
        balances[0].status === 'fulfilled'
          ? balances[0].value
          : { available: '0', totalPledged: '0', currency: 'USDC' };

      const paymentBalance =
        balances[1].status === 'fulfilled'
          ? balances[1].value
          : { available: '0', totalPledged: '0', currency: 'USDC' };

      // Combine balances
      const totalAvailable = (
        parseFloat(cryptoBalance.available) +
        parseFloat(paymentBalance.available)
      ).toString();

      const totalPledged = (
        parseFloat(cryptoBalance.totalPledged) +
        parseFloat(paymentBalance.totalPledged)
      ).toString();

      return {
        available: totalAvailable,
        totalPledged: totalPledged,
        currency: 'USDC',
      };
    } catch (error) {
      console.error('Error getting combined treasury balance:', error);
      return {
        available: '0',
        totalPledged: '0',
        currency: 'USDC',
      };
    }
  }

  /**
   * Validate both treasury deployments
   */
  async validateDeployment(treasuryAddress: string): Promise<boolean> {
    try {
      const campaignId =
        await this.getCampaignIdFromTreasuryAddress(treasuryAddress);
      if (!campaignId) return false;

      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          cryptoTreasuryAddress: true,
          paymentTreasuryAddress: true,
        },
      });

      if (!campaign) return false;

      if (campaign.paymentTreasuryAddress === treasuryAddress) {
        return await this.paymentTreasuryManager.validateDeployment(
          treasuryAddress,
        );
      } else if (campaign.cryptoTreasuryAddress === treasuryAddress) {
        return await this.cryptoTreasuryManager.validateDeployment(
          treasuryAddress,
        );
      }

      return false;
    } catch (error) {
      console.error('Error validating dual treasury deployment:', error);
      return false;
    }
  }

  /**
   * Helper method to find campaign ID from treasury address
   */
  private async getCampaignIdFromTreasuryAddress(
    treasuryAddress: string,
  ): Promise<number | null> {
    try {
      const campaign = await db.campaign.findFirst({
        where: {
          OR: [
            { cryptoTreasuryAddress: treasuryAddress },
            { paymentTreasuryAddress: treasuryAddress },
            { treasuryAddress: treasuryAddress }, // Backwards compatibility
          ],
        },
        select: { id: true },
      });

      return campaign?.id || null;
    } catch (error) {
      console.error('Error finding campaign by treasury address:', error);
      return null;
    }
  }

  /**
   * Get deployment status for both treasuries
   */
  async getDeploymentStatus(campaignId: number): Promise<{
    cryptoDeployed: boolean;
    paymentDeployed: boolean;
    bothDeployed: boolean;
  }> {
    try {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          cryptoTreasuryAddress: true,
          paymentTreasuryAddress: true,
        },
      });

      if (!campaign) {
        return {
          cryptoDeployed: false,
          paymentDeployed: false,
          bothDeployed: false,
        };
      }

      const cryptoDeployed = Boolean(campaign.cryptoTreasuryAddress);
      const paymentDeployed = Boolean(campaign.paymentTreasuryAddress);

      return {
        cryptoDeployed,
        paymentDeployed,
        bothDeployed: cryptoDeployed && paymentDeployed,
      };
    } catch (error) {
      console.error('Error getting deployment status:', error);
      return {
        cryptoDeployed: false,
        paymentDeployed: false,
        bothDeployed: false,
      };
    }
  }
}
