/**
 * Types for gateway pledge execution via Daimo Pay
 *
 * These types define the request/response interfaces for executing pledges
 * through payment gateways (e.g., Daimo Pay) using the admin wallet intermediary.
 */

/**
 * Request to execute a gateway pledge using setFeeAndPledge
 *
 * @property paymentId - Internal payment record ID (from our database)
 */
export interface ExecuteGatewayPledgeRequest {
  paymentId: string;
}

/**
 * Response from gateway pledge execution
 *
 * @property success - Whether the pledge was executed successfully
 * @property pledgeId - On-chain pledge ID (bytes32)
 * @property transactionHash - Transaction hash of the setFeeAndPledge call
 * @property blockNumber - Block number where transaction was confirmed
 * @property pledgeAmount - Amount sent to treasury (excluding tip)
 * @property tipAmount - Amount kept in admin wallet
 */
export interface ExecuteGatewayPledgeResponse {
  success: boolean;
  pledgeId: string;
  transactionHash: string;
  blockNumber: number;
  pledgeAmount: string;
  tipAmount: string;
}

/**
 * Metadata stored in payment record after gateway pledge execution
 *
 * This metadata is added to the payment.metadata field to track
 * the on-chain pledge execution details.
 *
 * @property onChainPledgeId - The pledge ID used in the contract (bytes32)
 * @property treasuryTxHash - Transaction hash of the setFeeAndPledge call
 * @property executionTimestamp - ISO timestamp when pledge was executed
 * @property adminWalletBalanceBefore - Admin wallet USDT balance before execution
 * @property adminWalletBalanceAfter - Admin wallet USDT balance after execution
 */
export interface GatewayPledgeMetadata {
  onChainPledgeId?: string;
  treasuryTxHash?: string;
  executionTimestamp?: string;
  adminWalletBalanceBefore?: string;
  adminWalletBalanceAfter?: string;
}

