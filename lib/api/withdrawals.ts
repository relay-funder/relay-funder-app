import { db, type Prisma } from '@/server/db';

export type WithdrawalListItem = Prisma.WithdrawalGetPayload<{
  include: {
    campaign: true;
  };
}> & {
  createdBy: {
    id: number;
    address: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
  };
  approvedBy: {
    id: number;
    address: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  campaignCreator?: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

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
  /**
   * Filter by execution state
   * - 'EXECUTED' -> transactionHash != null
   * - 'NOT_EXECUTED' -> transactionHash == null
   * - undefined -> no filter
   */
  executionStatus?: 'EXECUTED' | 'NOT_EXECUTED';
  /**
   * Filter by request type
   * - 'ON_CHAIN_AUTHORIZATION' -> on-chain authorization requests
   * - 'WITHDRAWAL_AMOUNT' -> individual withdrawal amount requests
   * - undefined -> no filter
   */
  requestType?: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT';
  /**
   * Filter by creator type
   * - 'admin' -> only admin-initiated withdrawals (createdBy has admin role)
   * - 'user' -> only user-initiated withdrawals (createdBy does not have admin role)
   * - undefined -> no filter (all withdrawals)
   */
  createdByType?: 'admin' | 'user';
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
  requestType,
  createdByType,
  executionStatus,
}: ListWithdrawalsParams = {}): Promise<ListWithdrawalsResult> {
  const where: Prisma.WithdrawalWhereInput = {};

  if (typeof campaignId === 'number') {
    where.campaignId = campaignId;
  }
  // Build createdBy filter object
  const createdByFilter: Prisma.UserWhereInput = {};
  if (createdByAddress && createdByAddress.trim().length > 0) {
    createdByFilter.address = createdByAddress;
  }
  // Filter by creator type (admin vs user)
  if (createdByType === 'admin') {
    createdByFilter.roles = { has: 'admin' };
  } else if (createdByType === 'user') {
    // For array filters, use NOT at the top level to check "does not contain"
    createdByFilter.NOT = {
      roles: { has: 'admin' },
    };
  }
  // Only add createdBy filter if we have any conditions
  if (Object.keys(createdByFilter).length > 0) {
    where.createdBy = createdByFilter;
  }

  if (token && token.trim().length > 0) {
    where.token = token;
  }
  if (status === 'APPROVED') {
    where.approvedById = { not: null };
  } else if (status === 'PENDING') {
    where.approvedById = null;
  }
  if (requestType) {
    where.requestType = requestType;
  }
  if (executionStatus === 'EXECUTED') {
    where.transactionHash = { not: null };
  } else if (executionStatus === 'NOT_EXECUTED') {
    where.transactionHash = null;
  }

  const [items, totalCount] = await Promise.all([
    db.withdrawal.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: true,
        createdBy: {
          select: {
            id: true,
            address: true,
            username: true,
            firstName: true,
            lastName: true,
            roles: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            address: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    db.withdrawal.count({ where }),
  ]);

  // Fetch campaign creator information for each withdrawal
  // Funds always go to the campaign creator
  const uniqueCreatorAddresses = [
    ...new Set(items.map((item) => item.campaign.creatorAddress)),
  ];
  const creatorUsers = await db.user.findMany({
    where: { address: { in: uniqueCreatorAddresses } },
    select: {
      id: true,
      address: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });
  const creatorMap = new Map(
    creatorUsers.map((user) => [user.address.toLowerCase(), user]),
  );

  const enrichedItems: WithdrawalListItem[] = items.map((item) => {
    const creatorUser = creatorMap.get(
      item.campaign.creatorAddress.toLowerCase(),
    );
    return {
      ...item,
      campaignCreator: creatorUser ?? null,
    } as WithdrawalListItem;
  });

  return {
    withdrawals: enrichedItems,
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
