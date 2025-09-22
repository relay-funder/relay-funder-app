import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  getWithdrawal,
  updateWithdrawal,
  removeWithdrawal,
} from '@/lib/api/withdrawals';
import { z } from 'zod';

interface WithdrawalWithIdParams {
  params: Promise<{
    id: string;
  }>;
}

const PatchAdminWithdrawalSchema = z.object({
  transactionHash: z.string().optional().or(z.null()),
  notes: z.string().optional().or(z.null()),
  approvedById: z.number().int().optional().or(z.null()),
});

export async function GET(_req: Request, { params }: WithdrawalWithIdParams) {
  try {
    await checkAuth(['admin']);
    const { id } = await params;
    const withdrawalId = Number.parseInt(id);
    if (Number.isNaN(withdrawalId)) {
      throw new ApiParameterError('Invalid withdrawal id');
    }

    const instance = await getWithdrawal(withdrawalId);
    if (!instance) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    return response({ withdrawal: instance });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: WithdrawalWithIdParams) {
  try {
    await checkAuth(['admin']);
    const { id } = await params;
    const withdrawalId = Number.parseInt(id);
    if (Number.isNaN(withdrawalId)) {
      throw new ApiParameterError('Invalid withdrawal id');
    }

    const body = PatchAdminWithdrawalSchema.parse(await req.json());
    const updated = await updateWithdrawal(withdrawalId, body);

    return response({ withdrawal: updated });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: WithdrawalWithIdParams) {
  try {
    await checkAuth(['admin']);
    const { id } = await params;
    const withdrawalId = Number.parseInt(id);
    if (Number.isNaN(withdrawalId)) {
      throw new ApiParameterError('Invalid withdrawal id');
    }

    // Ensure the item exists to return a proper 404
    const existing = await getWithdrawal(withdrawalId);
    if (!existing) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    await removeWithdrawal(withdrawalId);
    return response({ success: true });
  } catch (error: unknown) {
    return handleError(error);
  }
}
