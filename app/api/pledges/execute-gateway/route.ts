import { response, handleError } from '@/lib/api/response';
import { executeGatewayPledge } from '@/lib/api/pledges/execute-gateway-pledge';
import { debugApi as debug } from '@/lib/debug';
import { z } from 'zod';
import type { ExecuteGatewayPledgeRequest } from '@/lib/api/types/pledges';

const ExecuteGatewayPledgeSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
});

/**
 * POST /api/pledges/execute-gateway
 *
 * API endpoint wrapper for executing gateway pledges.
 * Can be used for manual retry of failed executions.
 *
 * The actual logic is in lib/api/pledges/execute-gateway-pledge.ts
 * and is shared with the webhook handler.
 */
export async function POST(req: Request) {
  try {
    debug && console.log('[Execute Gateway API] Starting pledge execution');

    // Validate request body
    const body = await req.json();
    const validatedData = ExecuteGatewayPledgeSchema.parse(
      body,
    ) as ExecuteGatewayPledgeRequest;

    const { paymentId } = validatedData;

    debug && console.log('[Execute Gateway API] Processing payment:', { paymentId });

    // Execute the pledge using shared logic
    const result = await executeGatewayPledge(paymentId);

    return response(result);
  } catch (error: unknown) {
    console.error('[Execute Gateway API] Error:', error);
    return handleError(error);
  }
}

