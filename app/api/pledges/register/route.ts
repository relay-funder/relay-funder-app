import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError, ApiUpstreamError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { ethers } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { debugApi as debug } from '@/lib/debug';
import { z } from 'zod';

// In-memory lock to prevent concurrent registrations from the same user
// Maps userAddress -> { pledgeId, timestamp }
const registrationLocks = new Map<
  string,
  { pledgeId: string; timestamp: number }
>();
const LOCK_TIMEOUT_MS = 120000; // 2 minutes timeout for locks

function acquireLock(userAddress: string, pledgeId: string): boolean {
  const existing = registrationLocks.get(userAddress);
  const now = Date.now();

  // Clean up expired locks
  if (existing && now - existing.timestamp > LOCK_TIMEOUT_MS) {
    debug &&
      console.log(
        '[pledges/register] Cleaning up expired lock for:',
        userAddress,
      );
    registrationLocks.delete(userAddress);
  }

  // Check if lock exists for this user
  if (registrationLocks.has(userAddress)) {
    const lock = registrationLocks.get(userAddress)!;
    debug &&
      console.log('[pledges/register] Lock already exists:', {
        userAddress,
        existingPledgeId: lock.pledgeId,
        newPledgeId: pledgeId,
        ageSeconds: (now - lock.timestamp) / 1000,
      });
    return false;
  }

  // Acquire lock
  registrationLocks.set(userAddress, { pledgeId, timestamp: now });
  debug && console.log('[pledges/register] Lock acquired for:', userAddress);
  return true;
}

function releaseLock(userAddress: string): void {
  registrationLocks.delete(userAddress);
  debug && console.log('[pledges/register] Lock released for:', userAddress);
}

const RegisterPledgeSchema = z.object({
  treasuryAddress: z
    .string()
    .min(1, 'Treasury address is required')
    .refine((addr) => ethers.isAddress(addr), 'Invalid treasury address'),
  pledgeId: z
    .string()
    .min(1, 'Pledge ID is required')
    .refine(
      (id) => id.startsWith('0x') && id.length === 66,
      'Invalid pledge ID format',
    ),
  gatewayFee: z.number().nonnegative().default(0),
});

/**
 * POST /api/pledges/register
 *
 * Registers a pledge ID with the treasury contract using platform admin credentials.
 * This is a privileged operation that must be performed by the backend before
 * the user can submit their pledge transaction.
 *
 * Required for KeepWhatsRaised treasury: setPaymentGatewayFee must be called
 * by a platform admin BEFORE the backer's pledge transaction.
 */
export async function POST(req: Request) {
  try {
    // Authenticate the user making the request
    const session = await checkAuth(['user']);

    // Validate request body
    const body = await req.json();
    const validatedData = RegisterPledgeSchema.parse(body);

    const { treasuryAddress, pledgeId, gatewayFee } = validatedData;
    const userAddress = session.user.address;

    debug &&
      console.log('[pledges/register] Registering pledge:', {
        treasuryAddress,
        pledgeId,
        gatewayFee,
        userAddress,
      });

    // Try to acquire lock to prevent concurrent registrations
    if (!acquireLock(userAddress, pledgeId)) {
      throw new ApiParameterError(
        'A pledge registration is already in progress. Please wait for it to complete.',
      );
    }

    try {
      // Verify required environment variables
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      const adminPk = process.env.PLATFORM_ADMIN_PRIVATE_KEY;

      if (!rpcUrl || !adminPk) {
        console.error(
          '[pledges/register] Missing required environment variables',
        );
        throw new ApiParameterError(
          'Server configuration error: missing RPC or admin credentials',
        );
      }

      // Initialize provider and admin signer
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(adminPk, provider);

      debug &&
        console.log(
          '[pledges/register] Admin signer address:',
          adminSigner.address,
        );

      // Initialize treasury contract with admin signer
      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        KeepWhatsRaisedABI,
        adminSigner,
      );

      // Set payment gateway fee (privileged operation)
      try {
        debug &&
          console.log('[pledges/register] Calling setPaymentGatewayFee...');

        // Get current nonce to ensure proper transaction ordering
        const nonce = await provider.getTransactionCount(
          adminSigner.address,
          'pending',
        );

        debug && console.log('[pledges/register] Using nonce:', nonce);

        const tx = await treasuryContract.setPaymentGatewayFee(
          pledgeId,
          gatewayFee,
          {
            nonce, // Explicitly set nonce
            maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'), // Tip for validators
            maxFeePerGas: ethers.parseUnits('100', 'gwei'), // Max total fee
          },
        );

        debug && console.log('[pledges/register] Transaction hash:', tx.hash);

        // Wait for confirmation with timeout
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Transaction timeout after 60s')),
              60000,
            ),
          ),
        ]);

        debug &&
          console.log(
            '[pledges/register] Transaction confirmed in block:',
            receipt.blockNumber,
          );

        return response({
          success: true,
          pledgeId,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          message: 'Pledge ID registered successfully',
        });
      } catch (contractError) {
        console.error(
          '[pledges/register] Contract call failed:',
          contractError,
        );

        // Extract meaningful error message with specific handling
        let errorMessage = 'Failed to register pledge with treasury';
        let errorCode = 'UNKNOWN_ERROR';

        if (contractError instanceof Error) {
          errorMessage = contractError.message;

          // Handle specific error cases
          if ('code' in contractError) {
            errorCode = String(contractError.code);
          }

          // Provide user-friendly messages for common errors
          if (errorCode === 'REPLACEMENT_UNDERPRICED') {
            errorMessage =
              'Transaction already pending. Please wait a moment and try again.';
          } else if (errorCode === 'NONCE_EXPIRED') {
            errorMessage = 'Transaction nonce conflict. Please try again.';
          } else if (errorMessage.includes('timeout')) {
            errorMessage =
              'Transaction confirmation timeout. Your pledge may still be processing.';
          }
        }

        throw new ApiUpstreamError(`${errorMessage} (${errorCode})`);
      }
    } finally {
      // Always release the lock, even if an error occurred
      releaseLock(userAddress);
    }
  } catch (error: unknown) {
    return handleError(error);
  }
}
