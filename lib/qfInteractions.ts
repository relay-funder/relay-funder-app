import { type Abi, encodeAbiParameters, parseAbiParameters, type Address, type Hash, type WriteContractParameters, type ReadContractParameters, encodeFunctionData, getContractAddress } from 'viem'
// Import only necessary functions from @wagmi/core for reads if needed server-side,but primarily rely on client-side hooks for writes.
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi'
import { ALLO_ADDRESS, KICKSTARTER_QF_ADDRESS } from './constant'
import { type Chain } from 'wagmi/chains' // Import Chain type
import { deployContract } from 'wagmi/actions'

// --- Import ABIs ---
import { AlloABI } from '../contracts/abi/qf/Allo'
import { KickStarterQFABI } from '../contracts/abi/qf/KickStarterQF'
import { ERC20ABI } from '../contracts/abi/qf/ERC20'

const alloAbi = AlloABI as Abi
const kickstarterQfAbi = KickStarterQFABI as Abi
const erc20Abi = ERC20ABI as Abi

const NATIVE_TOKEN_ADDRESS: Address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

// --- Type Definitions ---
// (Keep existing interfaces: Metadata, RecipientInitializeData, Claim, ApplicationStatusMap, ApplicationStatus)

// ==================================
// Phase 1: Create Pool - Prepare Args (Using createPool)
// ==================================

interface CreatePoolArgs {
    profileId: Hash // bytes32
    // strategyAddress is now the *implementation* address to clone
    strategyImplementationAddress?: Address // Defaults to KICKSTARTER_QF_ADDRESS
    initializationData: {
        recipientInitializeData: RecipientInitializeData
        allocationStartTime: bigint // uint64
        allocationEndTime: bigint // uint64
        withdrawalCooldown: bigint // uint64
        allowedTokens: Address[]
        isUsingAllocationMetadata: boolean // Likely false based on KickstarterQF._allocate
    }
    token: Address // Pool's native token (e.g., USDC address)
    amount: bigint // Initial funding amount (requires prior ERC20 approval to ALLO_ADDRESS)
    metadata: Metadata
    managers: Address[]
}

// This function now prepares the arguments for Allo's `createPool` function
export function prepareCreatePoolArgs({
    profileId,
    strategyImplementationAddress = KICKSTARTER_QF_ADDRESS, // Use implementation address
    initializationData,
    token,
    amount,
    metadata,
    managers,
}: CreatePoolArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log("Encoding strategy initialization data for createPool...")

    // Encode the strategy's initialization data structure
    // Ensure this matches EXACTLY what your KickstarterQF._initializeStrategy expects
    const encodedInitData = encodeAbiParameters(
        parseAbiParameters([
            // RecipientInitializeData struct definition
            '(bool metadataRequired, uint64 registrationStartTime, uint64 registrationEndTime)',
            'uint64', // allocationStartTime
            'uint64', // allocationEndTime
            'uint64', // withdrawalCooldown
            'address[]', // allowedTokens
            'bool' // isUsingAllocationMetadata
        ]),
        [
            initializationData.recipientInitializeData,
            initializationData.allocationStartTime,
            initializationData.allocationEndTime,
            initializationData.withdrawalCooldown,
            initializationData.allowedTokens,
            initializationData.isUsingAllocationMetadata
        ]
    )

    console.log("Preparing createPool transaction arguments...")
    // Arguments for Allo's `createPool` function
    const args = [
        profileId,                      // _profileId (bytes32)
        strategyImplementationAddress,  // _strategy (address of the implementation to clone)
        encodedInitData,                // _initStrategyData (bytes)
        token,                          // _token (address)
        amount,                         // _amount (uint256)
        metadata,                       // _metadata (Metadata struct)
        managers                        // _managers (address[])
    ];

    const requestArgs = {
        address: ALLO_ADDRESS, // Target Allo Proxy contract
        abi: alloAbi,
        functionName: 'createPoolWithCustomStrategy',
        args: args,
        // Remove optional properties that might cause type conflicts
        // type: undefined, // Explicitly undefined or remove if not needed
    } // satisfies Omit<WriteContractParameters, 'account' | 'chain'> // Keep satisfies for checking

    // Remove potentially problematic optional fields before returning
    // This helps avoid the transaction type mismatch error with useWriteContract
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address as `0x${string}`,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
    };
    if (requestArgs.value) {
        finalArgs.value = requestArgs?.value; 
    }

    return finalArgs;
}


// (Keep existing prepareRegisterRecipientArgs, prepareReviewRecipientsArgs, etc.)
// ...

// ==================================
// Utility: Check ERC20 Allowance (Read Operation - Fix chainId type)
// ==================================

interface CheckAllowanceArgs {
    tokenAddress: Address
    ownerAddress: Address
    spenderAddress: Address
    chainId?: number // Keep as number, but handle potential type mismatch below
}

export async function checkErc20Allowance({ tokenAddress, ownerAddress, spenderAddress, chainId }: CheckAllowanceArgs): Promise<bigint> {
    console.log(`Checking ERC20 allowance for token ${tokenAddress}, owner ${ownerAddress}, spender ${spenderAddress}...`)
    try {
        // Ensure chainId is compatible with Wagmi's expected type (number | undefined)
        // Wagmi's readContract internally maps number to specific chain configs if available
        const allowance = await readContract(config, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [ownerAddress, spenderAddress],
            chainId: chainId, // Pass chainId directly
        })
        console.log(`Current allowance: ${allowance}`)
        return allowance as bigint // Cast the result
    } catch (error) {
        console.error("Failed to read allowance:", error)
        throw new Error(`Could not check allowance: ${error instanceof Error ? error.message : String(error)}`)
    }
}

// ==================================
// Utility: Read DIRECT_TRANSFER flag (Read Operation - Fix chainId type)
// ==================================
interface ReadDirectTransferArgs {
    strategyAddress: Address
    chainId?: number // Keep as number
}

export async function checkDirectTransferFlag({ strategyAddress, chainId }: ReadDirectTransferArgs): Promise<boolean> {
    console.log(`Checking DIRECT_TRANSFER flag for strategy ${strategyAddress}...`)
    try {
        // Ensure chainId is compatible
        const isDirectTransfer = await readContract(config, {
            address: strategyAddress,
            abi: kickstarterQfAbi,
            functionName: 'DIRECT_TRANSFER',
            chainId: chainId, // Pass chainId directly
        }) as boolean
        console.log(`DIRECT_TRANSFER flag: ${isDirectTransfer}`)
        return isDirectTransfer
    } catch (error) {
        console.error("Failed to read DIRECT_TRANSFER flag:", error)
        throw new Error(`Could not read DIRECT_TRANSFER flag: ${error instanceof Error ? error.message : String(error)}`)
    }
}

// (Keep prepareApproveErc20Args as is, but ensure it also returns a clean object like prepareCreatePoolArgs)
export function prepareApproveErc20Args({ tokenAddress, spenderAddress, amount }: ApproveErc20Args): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing ERC20 approve transaction arguments for token ${tokenAddress}...`)
    const requestArgs = {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, amount],
    } // satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    // Return a clean object
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
    };

    console.log(`Args prepared for approving spender ${spenderAddress} for amount ${amount}...`)
    return finalArgs;
}


// ==================================
// Phase 4: Allocate Funds (Single Allocation) - Prepare Args
// ==================================

// Use this for allocating Native currency (e.g., ETH, MATIC)
interface AllocateNativeArgs {
    poolId: bigint
    recipientId: Address
    amount: bigint // Amount in native currency (wei)
}

// Prepares arguments for Allo's `allocate` function (Native)
export function prepareAllocateNativeArgs({ poolId, recipientId, amount }: AllocateNativeArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing native allocate transaction arguments for pool ${poolId}, recipient ${recipientId}...`)

    // Encode the recipient data (empty bytes for native allocation)
    const encodedRecipientData = '0x'

    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'allocate',
        args: [poolId, encodedRecipientData],
        value: amount, // Native amount is sent as msg.value
    }

    // Return a clean object
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
        value: requestArgs.value,
    };

    console.log(`Args prepared for native allocation of ${amount} wei...`)
    return finalArgs
}

// Use this for allocating ERC20 tokens
interface AllocateErc20Args {
    poolId: bigint
    recipientId: Address
    amount: bigint // Amount in token's smallest unit
    tokenAddress: Address // Address of the ERC20 token being allocated
}

// Prepares arguments for Allo's `allocate` function (ERC20)
export function prepareAllocateErc20Args({ poolId, recipientId, amount, tokenAddress }: AllocateErc20Args): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing ERC20 allocate transaction arguments for pool ${poolId}, recipient ${recipientId}, token ${tokenAddress}...`)

    // Encode the recipient data for ERC20 allocation
    const encodedRecipientData = encodeAbiParameters(
        parseAbiParameters(['address recipientId', 'uint256 amount', 'address tokenAddress']),
        [recipientId, amount, tokenAddress]
    )

    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'allocate',
        args: [poolId, encodedRecipientData],
        // No value for ERC20 allocation
    }

    // Return a clean object
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
    };

    console.log(`Args prepared for ERC20 allocation of ${amount} tokens...`)
    return finalArgs
}


// ==================================
// Phase 5: Distribute Funds - Prepare Args
// ==================================

interface DistributeArgs {
    poolId: bigint
    recipientIds: Address[]
    data: Hash // bytes - Typically '0x' unless the strategy requires specific data
}

// Prepares arguments for Allo's `distribute` function
export function prepareDistributeArgs({ poolId, recipientIds, data = '0x' }: DistributeArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing distribute transaction arguments for pool ${poolId}...`)

    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'distribute',
        args: [poolId, recipientIds, data],
    }

    // Return a clean object
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
    };

    console.log(`Args prepared for distributing funds to ${recipientIds.length} recipients...`)
    return finalArgs
}


// ==================================
// Phase 6: Withdraw Funds (KickstarterQF Specific) - Prepare Args
// ==================================

interface WithdrawArgs {
    strategyAddress: Address // Address of the *specific* KickstarterQF instance for the pool
    recipientId: Address
    tokenAddress: Address // Token to withdraw
}

// Prepares arguments for KickstarterQF's `withdraw` function
export function prepareWithdrawArgs({ strategyAddress, recipientId, tokenAddress }: WithdrawArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing withdraw transaction arguments for strategy ${strategyAddress}, recipient ${recipientId}, token ${tokenAddress}...`)

    const requestArgs = {
        address: strategyAddress,
        abi: kickstarterQfAbi,
        functionName: 'withdraw',
        args: [recipientId, tokenAddress],
    }

    // Return a clean object
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
    };

    console.log(`Args prepared for withdrawing token ${tokenAddress}...`)
    return finalArgs
}

// ==================================
// Phase 7: Claim Allocations (KickstarterQF Specific) - Prepare Args
// ==================================

interface ClaimAllocationArgs {
    strategyAddress: Address // Address of the *specific* KickstarterQF instance for the pool
    claims: Claim[] // Array of { recipientId, token } structs
}

// Note: The check for DIRECT_TRANSFER still needs to happen client-side before calling this
// Prepares arguments for KickstarterQF's `claimAllocations` function
export function prepareClaimAllocationsArgs({ strategyAddress, claims }: ClaimAllocationArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing claimAllocations transaction arguments for strategy ${strategyAddress}...`)

    const requestArgs = {
        address: strategyAddress,
        abi: kickstarterQfAbi,
        functionName: 'claimAllocations',
        args: [claims],
    }

    // Return a clean object
    const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
        address: requestArgs.address,
        abi: requestArgs.abi,
        functionName: requestArgs.functionName,
        args: requestArgs.args,
    };

    console.log(`Args prepared for claiming ${claims.length} allocations...`)
    return finalArgs
}


// ==================================
// Utility: ERC20 Approve - Prepare Args
// ==================================

interface ApproveErc20Args {
    tokenAddress: Address
    spenderAddress: Address // e.g., ALLO_ADDRESS for allocateErc20, or strategyAddress if needed elsewhere
    amount: bigint
}

// export function prepareApproveErc20Args({ tokenAddress, spenderAddress, amount }: ApproveErc20Args): Omit<WriteContractParameters, 'account' | 'chain'> {
//     console.log(`Preparing ERC20 approve transaction arguments for token ${tokenAddress}...`)
//     const requestArgs = {
//         address: tokenAddress,
//         abi: erc20Abi,
//         functionName: 'approve',
//         args: [spenderAddress, amount],
//     } // satisfies Omit<WriteContractParameters, 'account' | 'chain'>

//     // Return a clean object
//     const finalArgs: Omit<WriteContractParameters, 'account' | 'chain'> = {
//         address: requestArgs.address,
//         abi: requestArgs.abi,
//         functionName: requestArgs.functionName,
//         args: requestArgs.args,
//     };

//     console.log(`Args prepared for approving spender ${spenderAddress} for amount ${amount}...`)
//     return finalArgs;
// }

// ========================================
// Strategy Deployment - Prior to Pool Creation
// ========================================

interface DeployKickstarterQFArgs {
    allo: Address // Allo contract address
    name: string  // Strategy name (best to make unique)
    directTransfers: boolean // Whether direct transfers are enabled
}

/**
 * Prepares arguments for deploying a new KickstarterQF contract
 * Note: This function returns the transaction parameters, not a promise
 * The actual deployment should be done with wagmi's deployContract hook
 */
export function prepareDeployKickstarterQFArgs({
    allo = ALLO_ADDRESS,
    name,
    directTransfers = false
}: DeployKickstarterQFArgs): {
    abi: Abi,
    bytecode: `0x${string}`,
    args: [Address, string, boolean]
} {
    const uniqueName = name || `KickstarterQF-${Date.now()}`;

    console.log(`Preparing to deploy KickstarterQF contract with name: ${uniqueName}`);

    return {
        abi: KickStarterQFABI.abi,
        bytecode: KickStarterQFABI.bytecode, // You need to make this available from your contract imports
        args: [allo, uniqueName, directTransfers]
    };
}

