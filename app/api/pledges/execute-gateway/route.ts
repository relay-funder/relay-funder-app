import { response, handleError } from '@/lib/api/response';
import { executeGatewayPledge } from '@/lib/api/pledges/execute-gateway-pledge';
import { debugApi as debug } from '@/lib/debug';
import { z } from 'zod';
import type { ExecuteGatewayPledgeRequest } from '@/lib/api/types/pledges';
import { checkAuth } from '@/lib/api/auth';

const ExecuteGatewayPledgeSchema = z.object({
  paymentId: z.number().int().positive('Payment ID must be a positive integer'),
});

/**
 * POST /api/pledges/execute-gateway
 *
 * Admin-only API endpoint for manual retry of failed gateway pledge executions.
 *
 * Note: The Daimo Pay webhook calls executeGatewayPledge() function directly,
 * not this HTTP endpoint. This is only for admin manual retries.
 *
 * The actual execution logic is in lib/api/pledges/execute-gateway-pledge.ts
 * and is shared with the Daimo Pay webhook handler.
 */
export async function POST(req: Request) {
  try {
    // Admin authentication required
    await checkAuth(['admin']);

    debug && console.log('[Execute Gateway API] Starting pledge execution');

    // Validate request body
    const body = await req.json();
    const validatedData = ExecuteGatewayPledgeSchema.parse(
      body,
    ) as ExecuteGatewayPledgeRequest;

    const { paymentId } = validatedData;

    debug &&
      console.log('[Execute Gateway API] Processing payment:', { paymentId });

    // Execute the pledge using shared logic
    const result = await executeGatewayPledge(paymentId);

    return response(result);
  } catch (error: unknown) {
    console.error('[Execute Gateway API] Error:', error);
    return handleError(error);
  }
}
