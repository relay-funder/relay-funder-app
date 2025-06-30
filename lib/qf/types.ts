import { Address, Hash } from '@/lib/web3/types';

//Define the missing interfaces
export interface RecipientInitializeData {
  metadataRequired: boolean;
  registrationStartTime: bigint;
  registrationEndTime: bigint;
}

export interface Metadata {
  protocol: bigint;
  pointer: string;
}

export interface Claim {
  recipientId: Address;
  token: Address;
}

//1. Create Pool - Prepare Args (Using createPoolWithCustomStrategy)
export interface CreatePoolArgs {
  profileId: Hash; // bytes32
  // strategyAddress is now the *implementation* address to clone
  strategyImplementationAddress?: Address; // Defaults to KICKSTARTER_QF_ADDRESS
  initializationData: {
    recipientInitializeData: RecipientInitializeData;
    allocationStartTime: bigint; // uint64
    allocationEndTime: bigint; // uint64
    withdrawalCooldown: bigint; // uint64
    allowedTokens: Address[];
    isUsingAllocationMetadata: boolean; // Likely false based on KickstarterQF._allocate
  };
  token: Address; // Pool's native token (e.g., USDC address)
  amount: bigint; // Initial funding amount (requires prior ERC20 approval to ALLO_ADDRESS)
  metadata: Metadata;
  managers: Address[];
}

export interface RegisterRecipientArgs {
  poolId: bigint;
  recipientAddresses?: Address[]; // Array of addresses to register (usually just one)
  recipientAddress: Address; // Primary address being registered
  recipientPayoutAddress: Address; // Address that will receive funds
  metadata: Metadata;
  proposalBid?: bigint; // Optional proposal bid amount
}

export enum ApplicationStatus {
  None = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Appealed = 4,
}

export interface ReviewRecipientsArgs {
  strategyAddress: Address; // Address of the specific KickstarterQF instance for the pool
  recipientIds: Address[];
  newStatuses: ApplicationStatus[]; // Use the enum
  recipientsCounter: bigint; // Read from strategy.recipientsCounter() before calling
}
export interface CheckAllowanceArgs {
  tokenAddress: Address;
  ownerAddress: Address;
  spenderAddress: Address;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chainId?: number; // Kept for backward compatibility but not used in readContract
}

export interface ReadDirectTransferArgs {
  strategyAddress: Address;
  chainId?: number; // Kept for backward compatibility but not used in readContract
}

export interface ApproveErc20Args {
  tokenAddress: Address;
  spenderAddress: Address;
  amount: bigint;
}

export interface AllocateNativeArgs {
  poolId: bigint;
  recipientId: Address;
  amount: bigint; // Amount in native currency (wei)
}
export interface AllocateErc20Args {
  poolId: bigint;
  recipientId: Address;
  amount: bigint; // Amount in token's smallest unit
  tokenAddress: Address; // Address of the ERC20 token being allocated
}
export interface DistributeArgs {
  poolId: bigint;
  recipientIds: Address[];
  data: Hash; // bytes - Typically '0x' unless the strategy requires specific data
}

export interface WithdrawArgs {
  strategyAddress: Address; // Address of the *specific* KickstarterQF instance for the pool
  recipientId: Address;
  tokenAddress: Address; // Token to withdraw
}
export interface ClaimAllocationArgs {
  strategyAddress: Address; // Address of the *specific* KickstarterQF instance for the pool
  claims: Claim[]; // Array of { recipientId, token } structs
}
export interface DeployKickstarterQFArgs {
  allo: Address; // Allo contract address
  name: string; // Strategy name (best to make unique)
  directTransfers: boolean; // Whether direct transfers are enabled
}
