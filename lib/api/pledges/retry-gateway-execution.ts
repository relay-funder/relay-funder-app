import { db } from '@/server/db';
import { executeGatewayPledge } from './execute-gateway-pledge';
import { debugApi as debug } from '@/lib/debug';

/**
 * Query payments that failed pledge execution and need manual retry.
 *
 * @returns List of payments that are confirmed but missing on-chain pledge
 */
export async function getFailedGatewayPledges() {
  debug && console.log('[Retry Helper] Querying failed gateway pledges');

  const payments = await db.payment.findMany({
    where: {
      status: 'confirmed',
      provider: 'daimo',
    },
    include: {
      user: true,
      campaign: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100, // Limit to recent failures
  });

  // Filter to only payments missing on-chain pledge
  const failedPledges = payments.filter((payment) => {
    const metadata = payment.metadata as Record<string, unknown>;
    return !metadata?.onChainPledgeId;
  });

  debug &&
    console.log('[Retry Helper] Found failed pledges:', {
      total: payments.length,
      withoutPledge: failedPledges.length,
    });

  return failedPledges;
}

/**
 * Retry pledge execution for a specific payment.
 *
 * @param paymentId - Payment ID to retry
 * @returns Execution result
 */
export async function retryGatewayPledge(paymentId: string) {
  debug &&
    console.log('[Retry Helper] Retrying pledge for payment:', paymentId);

  try {
    const result = await executeGatewayPledge(paymentId);

    debug &&
      console.log('[Retry Helper] Retry successful:', {
        paymentId,
        pledgeId: result.pledgeId,
      });

    return {
      success: true,
      paymentId,
      result,
    };
  } catch (error) {
    console.error('[Retry Helper] Retry failed:', error);

    return {
      success: false,
      paymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch retry all failed gateway pledges.
 *
 * @returns Summary of retry results
 */
export async function retryAllFailedPledges() {
  debug && console.log('[Retry Helper] Starting batch retry');

  const failedPledges = await getFailedGatewayPledges();

  debug &&
    console.log('[Retry Helper] Retrying', failedPledges.length, 'pledges');

  const results = [];

  for (const payment of failedPledges) {
    const result = await retryGatewayPledge(payment.id);
    results.push(result);

    // Add delay between retries to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  debug &&
    console.log('[Retry Helper] Batch retry complete:', {
      total: results.length,
      successful,
      failed,
    });

  return {
    total: results.length,
    successful,
    failed,
    results,
  };
}
