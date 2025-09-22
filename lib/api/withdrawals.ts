import { db, type Prisma } from '@/server/db';

export type WithdrawalListItem = Prisma.WithdrawalGetPayload<{
  include: {
    campaign: true;
    createdBy: true;
    approvedBy: true;
  };
}>;

export interface ListWithdrawalsParams {
  page?: number;
  pageSize?: number;
  skip?: number;

  // Optional filters
  campaignId?: number;
  createdByAddress?: string;
  token?: string;
  /**
   * Filter by approval state
   * - 'APPROVED' -> approvedById != null
   * - 'PENDING'  -> approvedById == null
   * - undefined  -> no filter
   */
  status?: 'APPROVED' | 'PENDING';
}

export interface ListWithdrawalsResult {
  withdrawals: WithdrawalListItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

/**
 * List withdrawals with optional filters and pagination.
 * Mirrors the pagination shape used by other admin list endpoints.
 */
export async function listWithdrawals({
  page = 1,
  pageSize = 10,
  skip = 0,
  campaignId,
  createdByAddress,
  token,
  status,
}: ListWithdrawalsParams = {}): Promise<ListWithdrawalsResult> {
  const where: Prisma.WithdrawalWhereInput = {};

  if (typeof campaignId === 'number') {
    where.campaignId = campaignId;
  }
  if (createdByAddress && createdByAddress.trim().length > 0) {
    where.createdBy = { address: createdByAddress };
  }
  if (token && token.trim().length > 0) {
    where.token = token;
  }
  if (status === 'APPROVED') {
    where.approvedById = { not: null };
  } else if (status === 'PENDING') {
    where.approvedById = null;
  }

  const [items, totalCount] = await Promise.all([
    db.withdrawal.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: true,
        createdBy: true,
        approvedBy: true,
      },
    }),
    db.withdrawal.count({ where }),
  ]);

  return {
    withdrawals: items,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}

/**
 * Single withdrawal with relations for admin detail routes.
 */
export type WithdrawalWithRelations = Prisma.WithdrawalGetPayload<{
  include: {
    campaign: true;
    createdBy: true;
    approvedBy: true;
  };
}>;

export async function getWithdrawal(
  id: number,
): Promise<WithdrawalWithRelations | null> {
  return db.withdrawal.findUnique({
    where: { id },
    include: {
      campaign: true,
      createdBy: true,
      approvedBy: true,
    },
  });
}

export interface UpdateWithdrawalInput {
  transactionHash?: string | null;
  notes?: string | null;
  approvedById?: number | null;
}

/**
 * Update a withdrawal by id.
 * - transactionHash, notes are directly set
 * - approvedById: if null disconnects approval, if number connects to that user id
 */
export async function updateWithdrawal(
  id: number,
  data: UpdateWithdrawalInput,
): Promise<WithdrawalWithRelations> {
  const updateData: Prisma.WithdrawalUpdateInput = {};
  if (typeof data.transactionHash !== 'undefined') {
    updateData.transactionHash = data.transactionHash;
  }
  if (typeof data.notes !== 'undefined') {
    updateData.notes = data.notes;
  }
  if (typeof data.approvedById !== 'undefined') {
    updateData.approvedBy =
      data.approvedById === null
        ? { disconnect: true }
        : { connect: { id: data.approvedById } };
  }

  const updated = await db.withdrawal.update({
    where: { id },
    data: updateData,
    include: {
      campaign: true,
      createdBy: true,
      approvedBy: true,
    },
  });
  return updated;
}

/**
 * Delete a withdrawal by id.
 */
export async function removeWithdrawal(id: number) {
  return db.withdrawal.delete({ where: { id } });
}
