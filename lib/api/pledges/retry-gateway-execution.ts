import { executeGatewayPledge } from './execute-gateway-pledge';

/**
 * Retry pledge execution for a specific payment.
 * This is the core function used by the admin UI to manually retry failed pledges.
 *
 * Flow:
 * 1. Admin identifies failed payment in payments list
 * 2. Admin clicks "Retry" button
 * 3. This function calls executeGatewayPledge again
 * 4. executeGatewayPledge updates status fields automatically
 *
 * @param paymentId - Payment ID to retry
 * @returns Execution result with success status
 */
export async function retryGatewayPledge(paymentId: number) {
  console.log('[Retry] Retrying pledge execution for payment:', paymentId);

  try {
    const result = await executeGatewayPledge(paymentId);

    if (result.success) {
      console.log('[Retry] Pledge execution successful:', {
        paymentId,
        pledgeId: result.pledgeId,
        transactionHash: result.transactionHash,
      });

      return {
        success: true,
        paymentId,
        result,
      };
    } else {
      // Execution failed but was handled gracefully (FAILED status persisted)
      console.error('[Retry] Pledge execution failed (handled):', {
        paymentId,
        error: result.error,
      });

      return {
        success: false,
        paymentId,
        error: result.error || 'Unknown error',
      };
    }
  } catch (error) {
    // Unexpected error (should rarely happen now)
    console.error('[Retry] Pledge execution crashed (unexpected):', {
      paymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      paymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
