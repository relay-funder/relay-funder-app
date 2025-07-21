import { ethers } from 'ethers';

/**
 * Treasury deployment result interface
 */
export interface TreasuryDeploymentResult {
  address: string;
  transactionHash: string;
  deploymentStatus: 'success' | 'failed';
  error?: string;
}

/**
 * Payment processing result interface
 */
export interface PaymentProcessingResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  paymentId?: string;
}

/**
 * Treasury balance information
 */
export interface TreasuryBalance {
  available: string;
  totalPledged: string;
  currency: string;
}

/**
 * Withdrawal result interface
 */
export interface WithdrawalResult {
  success: boolean;
  transactionHash?: string;
  amount: string;
  recipient: string;
  error?: string;
}

/**
 * Treasury deployment parameters
 */
export interface TreasuryDeploymentParams {
  campaignId: number;
  campaignAddress: string;
  platformBytes: string;
  signer: ethers.Signer;
}

/**
 * Payment processing parameters
 */
export interface PaymentProcessingParams {
  amount: string;
  userAddress: string;
  treasuryAddress: string;
  paymentMethod: 'CRYPTO' | 'CREDIT_CARD';
  transactionId?: string;
  signer?: ethers.Signer;
}

/**
 * Withdrawal parameters
 */
export interface WithdrawalParams {
  amount: string;
  recipient: string;
  treasuryAddress: string;
  signer: ethers.Signer;
}

/**
 * Abstract interface for treasury management
 * Enables easy migration between dual treasury (MVP) and unified treasury (production)
 */
export abstract class TreasuryInterface {
  /**
   * Deploy a treasury contract for a campaign
   */
  abstract deploy(
    params: TreasuryDeploymentParams,
  ): Promise<TreasuryDeploymentResult>;

  /**
   * Get the deployed treasury address for a campaign
   */
  abstract getAddress(campaignId: number): Promise<string | null>;

  /**
   * Process a payment through the treasury
   */
  abstract processPayment(
    params: PaymentProcessingParams,
  ): Promise<PaymentProcessingResult>;

  /**
   * Withdraw funds from the treasury
   */
  abstract withdraw(params: WithdrawalParams): Promise<WithdrawalResult>;

  /**
   * Get treasury balance information
   */
  abstract getBalance(treasuryAddress: string): Promise<TreasuryBalance>;

  /**
   * Validate treasury deployment status
   */
  abstract validateDeployment(treasuryAddress: string): Promise<boolean>;
}

/**
 * Factory function to create appropriate treasury manager based on mode
 */
export async function createTreasuryManager(
  mode: 'DUAL' | 'UNIFIED' = 'DUAL',
): Promise<TreasuryInterface> {
  if (mode === 'DUAL') {
    // Import dynamically to avoid circular dependencies
    const { DualTreasuryManager } = await import(
      './managers/DualTreasuryManager'
    );
    return new DualTreasuryManager();
  } else {
    // Future implementation for unified treasury
    throw new Error('Unified treasury manager not yet implemented');
  }
}
