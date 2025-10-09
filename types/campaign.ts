import {
  GetCampaignPaymentSummary,
  GetRoundResponseInstance,
} from '@/lib/api/types';
import { DisplayUserWithStates } from '@/lib/api/types/user';
export interface Media {
  id: string;
  createdAt: Date;
  state: 'CREATED' | 'UPLOADED' | 'BLOCKED';
  url: string | File | null;
  caption?: string | null;
  mimeType: string;
}
export interface DbCampaign {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
  creatorAddress: string;
  status:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'ACTIVE'
    | 'DISABLED'
    | 'COMPLETED'
    | 'FAILED';
  transactionHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  campaignAddress: string | null;
  slug: string;
  location: string | null;
  treasuryAddress?: string | null;
  category?: string | null;
  featuredStart?: Date | null;
  featuredEnd?: Date | null;
  // collections, // hidden in api
  images?: CampaignImage[];
  media?: Media[];
  mediaOrder?: string[] | null;
  updates?: CampaignUpdate[];
  comments?: DbComment[];
  // favorites, // hidden in api
  payments?: DbPayment[];
  // RoundCampaigns: // hidden in api
  // transient from server
  rounds?: GetRoundResponseInstance[];
  paymentSummary?: GetCampaignPaymentSummary;
  creator?: DisplayUserWithStates;
  _count?: { comments: number; updates: number; rounds: number };
}

export type CampaignDisplay = {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
  creatorAddress: string;
  status: string;
  transactionHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
  campaignAddress?: string | null;
  slug: string;
  location?: string | null;
  treasuryAddress?: string | null;
  images: CampaignImage[];
  payments?: DbPayment[];
  confirmedPayments: DbPayment[];
  donationCount: number;
  comments?: Comment[];
  updates?: {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    campaignId: number;
    creatorAddress: string;
  }[];
};

export type DbComment = {
  id: number;
  content: string;
  userAddress: string;
  createdAt: Date;
  updatedAt: Date;
  campaignId: number;
  campaign?: Campaign;
  creator?: DisplayUserWithStates;
};
export type Comment = {
  id: number;
  content: string;
  userAddress: string;
  createdAt: Date;
  updatedAt: Date;
  campaignId: number;
  campaign?: Campaign;
};

export type CampaignImage = {
  id: number;
  imageUrl: string | File;
  isMainImage: boolean;
  campaignId: number;
  campaign?: Campaign;
};
export type CampaignUpdate = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  campaignId: number;
  creatorAddress: string;
};

export type DbPayment = {
  id: number;
  amount: string; // Stored as string to preserve precision
  token: string; // Standard: "USDC" (Circle's native multi-chain token on Celo)
  status: string; // 'pending' | 'confirmed' | 'failed'; // Assuming possible statuses
  type: 'BUY' | 'SELL';
  transactionHash: string | null;
  isAnonymous: boolean;
  metadata: { paymentMethod?: string; originalToken?: string } | null; // Stores payment method info and other metadata
  createdAt: Date;
  updatedAt: Date;
  campaignId: number;
  campaign?: Campaign;
  userId: number;
  user?: User; // Assuming you have a corresponding type for User
};
export type Payment = {
  paymentId: number;
  amount: string; // Stored as string to preserve precision
  token?: string; // e.g., "USDC"
  type?: 'BUY' | 'SELL';
  status?: string; // 'pending' | 'confirmed' | 'failed'; // Assuming possible statuses
  transactionHash?: string | null;
  isAnonymous?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  campaignId?: number;
  campaign?: Campaign;
  userId?: number;
  user?: User; // Assuming you have a corresponding type for User
};

type User = {
  id: number;
  address: string;
  rawAddress: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  payments?: Payment[];
  createdAt: Date;
  updatedAt: Date;
};
/**
 * Campaign
 * @deprecated, use DbCampaign consistently!
 */
export interface Campaign extends DbCampaign {
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  location: string | null;
  amountRaised?: string;
  confirmedPayments: DbPayment[];
  donationCount: number;
}

export interface CombinedCampaignData {
  id: number;
  title: string;
  description: string;
  status: string;
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  images: DbCampaign['images'];
  location: string | null;
  treasuryAddress: string | null;
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type CampaignCreatedEvent = {
  args: {
    identifierHash?: `0x${string}`;
    campaignInfoAddress?: `0x${string}`;
  };
};
/**
 * Defines the various states a donation process can be in.
 * Each state represents a step in the user's interaction with the wallet and blockchain.
 */
export const DonationProcessStates = {
  /**
   * The wallet is not connected to the application.
   * The user will be prompted to connect their wallet.
   * This step may or may not require direct user interaction.
   */
  connect: 'connect',

  /**
   * The wallet is connected but is on the wrong network.
   * The user may be prompted to switch to the correct network or add it if not already configured.
   * This step may or may not require direct user interaction.
   */
  switch: 'switch',

  /**
   * The application is requesting the wallet to set up certain properties for contract execution.
   * Multiple checks might occur here, and issues could require the user to restart the process.
   * This step is unlikely to require direct user interaction.
   */
  requestTransaction: 'requestTransaction',

  /**
   * The backend is registering the pledge ID with the treasury contract using admin credentials.
   * This privileged operation must complete before the user can proceed with their pledge.
   * No direct user interaction is required during this phase.
   */
  registerPledge: 'registerPledge',

  /**
   * The wallet is asked to execute a proxy-token contract to set a spending cap limit for USDC.
   * This action will require confirmation from the user within their wallet.
   */
  approveUsdcContract: 'approveUsdcContract',

  /**
   * The contract has been executed, and the application is waiting for blockchain confirmation.
   * No user interaction is required during this phase, but it can take some time.
   */
  waitForUsdcContractConfirmation: 'waitForUsdcContractConfirmation',

  /**
   * The wallet is asked to execute the treasury pledge contract.
   * This action locks the previously approved spending cap into the donation, transferring the funds.
   */
  pledgeContract: 'pledgeContract',

  /**
   * The pledge contract has been executed, and the application is waiting for blockchain confirmation.
   * No user interaction is required during this phase.
   */
  waitForPledgeContractConfirmation: 'waitForPledgeContractConfirmation',

  /**
   * The successful execution of the donation is being stored in the application's database.
   * This is typically the final step after blockchain confirmation.
   */
  storageComplete: 'storageComplete',

  /**
   * The initial idle state of the donation process, before any steps have begun.
   */
  idle: 'idle',

  /**
   * The donation process has successfully completed, and the requested funds have been transferred.
   */
  done: 'done',

  /**
   * The donation process has failed at some point.
   * An error message should be displayed to the user.
   */
  failed: 'failed',
};

export interface CampaignItemProps {
  campaign?: DbCampaign;
  isFavorite?: boolean;
  onSelect?: (arg0: DbCampaign) => Promise<void>;
  onApprove?: (arg0: DbCampaign) => Promise<void>;
  onDisable?: (arg0: DbCampaign) => Promise<void>;
  onFavoriteToggle?: (isFavorite: boolean) => Promise<void>;
  onCreate?: () => Promise<void>;
}

/**
 * Defines the various states a campaign create process can be in.
 * Each state represents a step in the user's interaction with the wallet and blockchain.
 */
export const CreateProcessStates = {
  /**
   * The deploy process is starting
   */
  setup: 'setup',

  /**
   * Validate platform setup and configuration
   */
  validatingPlatform: 'validatingPlatform',

  /**
   * Create the campaign in the database
   */
  create: 'create',

  /**
   * use CampaignInfoFactory smart-contract to create a treasury address for
   * this campaign
   */
  createOnChain: 'createOnChain',

  /**
   * waiting for the blockchain to confirm the transaction
   */
  waitForCreationConfirmation: 'waitForCreationConfirmation',

  /**
   * wait for db to store the transaction hash
   */
  updateDbCampaign: 'updateDbCampaign',

  /**
   * The initial idle state of the create process, before any steps have begun.
   */
  idle: 'idle',

  /**
   * Campaign created successfully and pending approval by an administrator.
   */
  done: 'done',

  /**
   * The creation process has failed at some point.
   * An error message should be displayed to the user.
   */
  failed: 'failed',
};

/**
 * Defines the various states a campaign update process can be in.
 * Each state represents a step in the user's interaction with the wallet and blockchain.
 */
export const UpdateProcessStates = {
  /**
   * The deploy process is starting
   */
  setup: 'setup',

  /**
   * Validate platform setup and configuration
   */
  validatingPlatform: 'validatingPlatform',

  /**
   * Create the campaign in the database (for edit flow compatibility)
   */
  create: 'create',

  /**
   * Create/update the campaign on-chain using smart contract
   */
  createOnChain: 'createOnChain',

  /**
   * Waiting for blockchain confirmation of the smart contract transaction
   */
  waitForCreationConfirmation: 'waitForCreationConfirmation',

  /**
   * wait for db to store the transaction hash
   */
  updateDbCampaign: 'updateDbCampaign',

  /**
   * The initial idle state of the create process, before any steps have begun.
   */
  idle: 'idle',

  /**
   * Campaign created successfully and pending approval by an administrator.
   */
  done: 'done',

  /**
   * The update process has failed at some point.
   * An error message should be displayed to the user.
   */
  failed: 'failed',
};
