import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  getWithdrawal,
  updateWithdrawal,
  removeWithdrawal,
} from '@/lib/api/withdrawals';
import { notify, notifyIntern } from '@/lib/api/event-feed';
import { getUser } from '@/lib/api/user';
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
    const session = await checkAuth(['admin']);
    const { id } = await params;
    const withdrawalId = Number.parseInt(id);
    if (Number.isNaN(withdrawalId)) {
      throw new ApiParameterError('Invalid withdrawal id');
    }

    // Get existing withdrawal to compare changes
    const existing = await getWithdrawal(withdrawalId);
    if (!existing) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    const body = PatchAdminWithdrawalSchema.parse(await req.json());
    const updated = await updateWithdrawal(withdrawalId, body);

    // Track changes for event
    const changes: {
      transactionHash?: string | null;
      notes?: string | null;
      approvedById?: number | null;
    } = {};

    if (
      typeof body.transactionHash !== 'undefined' &&
      body.transactionHash !== existing.transactionHash
    ) {
      changes.transactionHash = body.transactionHash;
    }
    if (typeof body.notes !== 'undefined' && body.notes !== existing.notes) {
      changes.notes = body.notes;
    }
    if (
      typeof body.approvedById !== 'undefined' &&
      body.approvedById !== existing.approvedById
    ) {
      changes.approvedById = body.approvedById;
    }

    // Verify admin user exists before proceeding with notifications
    const adminUser = await getUser(session.user.address);
    if (!adminUser) {
      throw new ApiNotFoundError('Admin user not found');
    }

    // Only create event if meaningful changes occurred
    if (Object.keys(changes).length > 0) {
      try {
        const campaignCreator = await getUser(updated.campaign.creatorAddress);
        const adminName =
          adminUser.username ||
          adminUser.firstName ||
          adminUser.address.slice(0, 10) + '...';
        if (campaignCreator) {
          await notify({
            receiverId: campaignCreator.id,
            creatorId: adminUser.id,
            data: {
              type: 'WithdrawalUpdated',
              withdrawalId: updated.id,
              campaignId: updated.campaign.id,
              campaignTitle: updated.campaign.title,
              amount: updated.amount,
              token: updated.token,
              adminName,
              changes,
            },
          });
        }
        // Also notify admin for audit trail
        await notifyIntern({
          creatorId: adminUser.id,
          data: {
            type: 'WithdrawalUpdated',
            withdrawalId: updated.id,
            campaignId: updated.campaign.id,
            campaignTitle: updated.campaign.title,
            amount: updated.amount,
            token: updated.token,
            adminName,
            changes,
          },
        });
      } catch (error) {
        console.error('Failed to create withdrawal update event', error);
      }
    }

    return response({ withdrawal: updated });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: WithdrawalWithIdParams,
) {
  try {
    const session = await checkAuth(['admin']);
    const { id } = await params;
    const withdrawalId = Number.parseInt(id);
    if (Number.isNaN(withdrawalId)) {
      throw new ApiParameterError('Invalid withdrawal id');
    }

    // Ensure the item exists to return a proper 404 and get details for event
    const existing = await getWithdrawal(withdrawalId);
    if (!existing) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    // Verify admin user exists before proceeding with notifications
    const adminUser = await getUser(session.user.address);
    if (!adminUser) {
      throw new ApiNotFoundError('Admin user not found');
    }

    // Track withdrawal deletion event before deletion
    try {
      const campaignCreator = await getUser(existing.campaign.creatorAddress);
      const adminName =
        adminUser.username ||
        adminUser.firstName ||
        adminUser.address.slice(0, 10) + '...';
      if (campaignCreator) {
        await notify({
          receiverId: campaignCreator.id,
          creatorId: adminUser.id,
          data: {
            type: 'WithdrawalDeleted',
            withdrawalId: existing.id,
            campaignId: existing.campaign.id,
            campaignTitle: existing.campaign.title,
            amount: existing.amount,
            token: existing.token,
            adminName,
          },
        });
      }
      // Also notify admin for audit trail
      await notifyIntern({
        creatorId: adminUser.id,
        data: {
          type: 'WithdrawalDeleted',
          withdrawalId: existing.id,
          campaignId: existing.campaign.id,
          campaignTitle: existing.campaign.title,
          amount: existing.amount,
          token: existing.token,
          adminName,
        },
      });
    } catch (error) {
      console.error('Failed to create withdrawal deletion event', error);
    }

    await removeWithdrawal(withdrawalId);
    return response({ success: true });
  } catch (error: unknown) {
    return handleError(error);
  }
}
