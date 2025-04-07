import { type Abi, encodeAbiParameters, parseAbiParameters, type Address, type Hash, type WriteContractParameters, type ReadContractParameters } from 'viem'
// Import only necessary functions from @wagmi/core for reads if needed server-side,but primarily rely on client-side hooks for writes.
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi'
import { ALLO_ADDRESS, KICKSTARTER_QF_ADDRESS } from './constant'

// --- Import ABIs ---
import { AlloABI } from '../contracts/abi/qf/Allo'
import { KickStarterQFABI } from '../contracts/abi/qf/KickStarterQF'
import { ERC20ABI } from '../contracts/abi/qf/ERC20'
// import { celoAlfajores } from 'wagmi/chains'

const alloAbi = AlloABI as Abi
const kickstarterQfAbi = KickStarterQFABI as Abi
const erc20Abi = ERC20ABI as Abi

const NATIVE_TOKEN_ADDRESS: Address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
// const chainID : Chain = celoAlfajores

interface Metadata {
    protocol: bigint // uint256
    pointer: string
}

interface RecipientInitializeData {
    metadataRequired: boolean
    registrationStartTime: bigint // uint64
    registrationEndTime: bigint // uint64
}

interface Claim {
    recipientId: Address
    token: Address
}

// Matches Solidity enum `ApplicationsState.Status` - Used in reviewRecipients
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApplicationStatusMap = {
    NONE: 0,
    PENDING: 1,
    ACCEPTED: 2,
    REJECTED: 3,
    APPEALED: 4,
} as const // Use const assertion to treat it as a type

type ApplicationStatus = typeof ApplicationStatusMap[keyof typeof ApplicationStatusMap]

// ==================================
// Phase 1: Create Pool - Prepare Args
// ==================================

interface CreatePoolArgs {
    profileId: Hash // bytes32
    // Use the specific KickstarterQF strategy instance deployed for this pool type
    strategyAddress?: Address // Defaults to the constant KICKSTARTER_QF_ADDRESS if not provided
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

// This function now prepares the arguments for writeContract, to be called client-side
export function prepareCreatePoolArgs({
    profileId,
    strategyAddress = KICKSTARTER_QF_ADDRESS,
    initializationData,
    token,
    amount,
    metadata,
    managers,
}: CreatePoolArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log("Encoding strategy initialization data...")
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
    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'createPoolWithCustomStrategy',
        args: [
            profileId,
            strategyAddress,
            encodedInitData,
            token,
            amount,
            metadata,
            managers,
        ],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}

// ==================================
// Phase 2: Register Recipient - Prepare Args
// ==================================

interface RegisterRecipientArgs {
    poolId: bigint
    recipientPayoutAddress: Address
    metadata: Metadata
}

export function prepareRegisterRecipientArgs({
    poolId,
    recipientPayoutAddress,
    metadata,
}: RegisterRecipientArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log("Encoding recipient registration data...")
    // Allo's registerRecipient calls the strategy's _handleRegistration hook.
    // The RecipientsExtension hook expects abi.decode(_data, (address recipientAddress, Metadata metadata))
    const encodedRegisterData = encodeAbiParameters(
        parseAbiParameters(['address', '(uint256 protocol, string pointer)']),
        [recipientPayoutAddress, metadata]
    )

    console.log("Preparing registerRecipient transaction arguments...")
    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'registerRecipient',
        args: [poolId, encodedRegisterData],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}

// ==================================
// Phase 3: Review Recipients - Prepare Args
// ==================================

interface ReviewRecipientsArgs {
    strategyAddress: Address // Address of the *specific* KickstarterQF instance for the pool
    recipientIds: Address[]
    newStatuses: ApplicationStatus[] // Use the ApplicationStatusMap values (0, 1, 2, 3, 4)
    recipientsCounter: bigint // Read from strategy.recipientsCounter() *before* calling
}

export function prepareReviewRecipientsArgs({
    strategyAddress,
    recipientIds,
    newStatuses,
    recipientsCounter,
}: ReviewRecipientsArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    if (recipientIds.length !== newStatuses.length) {
        throw new Error("Recipient IDs and statuses arrays must have the same length.")
    }
    if (recipientIds.length === 0) {
        throw new Error("No recipients provided for review.")
    }

    console.log("Preparing reviewRecipients transaction arguments...")
    // The function expects an *array* of ApplicationStatus structs:
    // struct ApplicationStatus { address[] recipientIds; uint256[] statuses; }
    // We send one struct containing all the updates in this batch.
    const applicationStatusStruct = {
        recipientIds: recipientIds,
        statuses: newStatuses.map(status => BigInt(status)) // Convert numbers to bigint
    }

    const requestArgs = {
        address: strategyAddress,
        abi: kickstarterQfAbi,
        functionName: 'reviewRecipients',
        // The function expects ApplicationStatus[] memory _statuses, uint256 _recipientsCounter
        args: [[applicationStatusStruct], recipientsCounter],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
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

export function prepareAllocateNativeArgs({
    poolId,
    recipientId,
    amount,
}: AllocateNativeArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log("Encoding native allocation data for strategy hook...")
    // KickstarterQF._allocate expects abi.decode(_data, (address _token, bytes memory _permit))
    // For native token, token address is NATIVE_TOKEN_ADDRESS and permit is '0x'
    const encodedAllocateData = encodeAbiParameters(
        parseAbiParameters(['address', 'bytes']),
        [NATIVE_TOKEN_ADDRESS, '0x']
    )

    console.log("Preparing allocate transaction arguments for native token...")
    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'allocate',
        args: [
            poolId,
            recipientId,
            amount, // Amount is passed directly for native token
            encodedAllocateData,
        ],
        value: amount, // The native currency amount being sent
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}

// Use this for allocating ERC20 tokens
interface AllocateErc20Args {
    poolId: bigint
    recipientId: Address
    amount: bigint // Amount of ERC20 token (smallest unit)
    tokenAddress: Address // Address of the ERC20 token being allocated
    permit?: Hash // Optional: EIP-2612 permit data (bytes), defaults to '0x'
    // Required: The address calling this function must have approved ALLO_ADDRESS
    // to spend at least `amount` of `tokenAddress`.
    // Call `approveErc20` first if needed.
}

export function prepareAllocateErc20Args({
    poolId,
    recipientId,
    amount,
    tokenAddress,
    permit = '0x',
}: AllocateErc20Args): Omit<WriteContractParameters, 'account' | 'chain'> {
    if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
        throw new Error("Use prepareAllocateNativeArgs for native currency allocations.")
    }

    console.log("Encoding ERC20 allocation data for strategy hook...")
    // KickstarterQF._allocate expects abi.decode(_data, (address _token, bytes memory _permit))
    const encodedAllocateData = encodeAbiParameters(
        parseAbiParameters(['address', 'bytes']),
        [tokenAddress, permit]
    )

    console.log(`Preparing allocate transaction arguments for ERC20 token ${tokenAddress}...`)
    // PRE-REQUISITE CHECK (Frontend Responsibility):
    // Ensure user has approved the ALLO_ADDRESS contract
    // to spend `amount` of `tokenAddress` if `permit` is '0x'.
    // You would typically use `readContract` to check allowance and `approveErc20` if needed.
    console.warn(`Ensure sufficient ERC20 approval for token ${tokenAddress} amount ${amount} to spender ${ALLO_ADDRESS}`)

    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'allocate',
        args: [
            poolId,
            recipientId,
            amount, // Amount is passed directly for ERC20 token
            encodedAllocateData,
        ],
        // chainId: chainId,
        // value should be 0 for ERC20 allocations
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}

// ==================================
// Phase 5: Set Payouts - Prepare Args
// ==================================

interface SetPayoutArgs {
    strategyAddress: Address // Address of the *specific* KickstarterQF instance for the pool
    recipientIds: Address[]
    amounts: bigint[] // QF-calculated payout amounts for each recipient
}

export function prepareSetPayoutArgs({
    strategyAddress,
    recipientIds,
    amounts,
}: SetPayoutArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    if (recipientIds.length !== amounts.length) {
        throw new Error("Recipient IDs and amounts arrays must have the same length.")
    }
    if (recipientIds.length === 0) {
        throw new Error("No payouts provided.")
    }

    console.log("Encoding payout data...")
    // The setPayout function expects abi.decode(_data, (address[], uint256[]))
    const encodedPayoutData = encodeAbiParameters(
        parseAbiParameters(['address[]', 'uint256[]']),
        [recipientIds, amounts]
    )

    console.log("Preparing setPayout transaction arguments...")
    const requestArgs = {
        address: strategyAddress,
        abi: kickstarterQfAbi,
        functionName: 'setPayout',
        args: [encodedPayoutData],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}

// ==================================
// Phase 6: Distribute Funds - Prepare Args
// ==================================

interface DistributeArgs {
    poolId: bigint
    recipientIds: Address[] // Recipients who have payouts set and are ready for distribution
}

export function prepareDistributeArgs({ poolId, recipientIds }: DistributeArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    if (recipientIds.length === 0) {
        throw new Error("No recipients provided for distribution.")
    }
    console.log("Preparing distribute transaction arguments...")
    // The KickstarterQF._distribute hook doesn't use the _data field, so pass '0x'
    const requestArgs = {
        address: ALLO_ADDRESS,
        abi: alloAbi,
        functionName: 'distribute',
        args: [poolId, recipientIds, '0x'],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}

// ==================================
// Phase 7: Claim Allocations - Prepare Args
// ==================================

interface ClaimAllocationArgs {
    strategyAddress: Address // Address of the *specific* KickstarterQF instance for the pool
    claims: Claim[] // Array of { recipientId, token } structs
}

// Note: The check for DIRECT_TRANSFER still needs to happen client-side before calling this
export function prepareClaimAllocationArgs({ strategyAddress, claims }: ClaimAllocationArgs): Omit<WriteContractParameters, 'account' | 'chain'> {
    if (claims.length === 0) {
        throw new Error("No claims provided.")
    }

    console.log("Encoding claim data...")
    // The claimAllocation function expects abi.decode(_data, (Claim[]))
    // Define the struct ABI string *exactly* as in Solidity
    const claimStructAbiString = '(address recipientId, address token)'
    const encodedClaimData = encodeAbiParameters(
        // Note the '[]' to indicate an array of the struct
        parseAbiParameters([`${claimStructAbiString}[]`]),
        [claims] // Pass the array of claim objects directly
    )

    console.log("Preparing claimAllocation transaction arguments...")
    const requestArgs = {
        address: strategyAddress,
        abi: kickstarterQfAbi,
        functionName: 'claimAllocation',
        args: [encodedClaimData],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    return requestArgs
}


// ==================================
// Utility: ERC20 Approve - Prepare Args
// ==================================

interface ApproveErc20Args {
    tokenAddress: Address
    spenderAddress: Address // e.g., ALLO_ADDRESS for allocateErc20, or strategyAddress if needed elsewhere
    amount: bigint
}

// This function now prepares the arguments for writeContract, to be called client-side
export function prepareApproveErc20Args({ tokenAddress, spenderAddress, amount }: ApproveErc20Args): Omit<WriteContractParameters, 'account' | 'chain'> {
    console.log(`Preparing ERC20 approve transaction arguments for token ${tokenAddress}...`)
    const requestArgs = {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, amount],
    } satisfies Omit<WriteContractParameters, 'account' | 'chain'>

    console.log(`Args prepared for approving spender ${spenderAddress} for amount ${amount}...`)
    return requestArgs
}

// ==================================
// Utility: Check ERC20 Allowance (Read Operation - Can stay as is)
// ==================================

interface CheckAllowanceArgs {
    tokenAddress: Address
    ownerAddress: Address
    spenderAddress: Address
    chainId?: number // Optional chainId if needed for config
}

export async function checkErc20Allowance({ tokenAddress, ownerAddress, spenderAddress, chainId }: CheckAllowanceArgs): Promise<bigint> {
    console.log(`Checking ERC20 allowance for token ${tokenAddress}, owner ${ownerAddress}, spender ${spenderAddress}...`)
    try {
        // Pass config as the first argument
        const allowance = await readContract(config, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [ownerAddress, spenderAddress],
            chainId: chainId, // Pass chainId if provided
        })
        console.log(`Current allowance: ${allowance}`)
        return allowance as bigint // Cast the result
    } catch (error) {
        console.error("Failed to read allowance:", error)
        // Consider returning 0n or a specific error state instead of throwing
        // if the frontend can handle it gracefully (e.g., assume approval needed)
        // For now, re-throwing to indicate a potential RPC or contract issue.
        throw new Error(`Could not check allowance: ${error instanceof Error ? error.message : String(error)}`)
    }
}

// ==================================
// Utility: Read DIRECT_TRANSFER flag (Read Operation)
// ==================================
interface ReadDirectTransferArgs {
    strategyAddress: Address
    chainId?: number
}

export async function checkDirectTransferFlag({ strategyAddress, chainId }: ReadDirectTransferArgs): Promise<boolean> {
    console.log(`Checking DIRECT_TRANSFER flag for strategy ${strategyAddress}...`)
    try {
        const isDirectTransfer = await readContract(config, {
            address: strategyAddress,
            abi: kickstarterQfAbi,
            functionName: 'DIRECT_TRANSFER',
            chainId: chainId,
        }) as boolean
        console.log(`DIRECT_TRANSFER flag: ${isDirectTransfer}`)
        return isDirectTransfer
    } catch (error) {
        console.error("Failed to read DIRECT_TRANSFER flag:", error)
        throw new Error(`Could not read DIRECT_TRANSFER flag: ${error instanceof Error ? error.message : String(error)}`)
    }
} 