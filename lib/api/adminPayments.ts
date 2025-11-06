import { db, type Prisma, type PledgeExecutionStatus } from '@/server/db';

/**
 * Shape of a payment record returned for admin lists.
 * Includes related campaign, user, and any associated round contributions.
 */
export type AdminPaymentListItem = Prisma.PaymentGetPayload<{
  include: {
    campaign: {
      select: {
        id: true;
        title: true;
        slug: true;
        campaignAddress: true;
        treasuryAddress: true;
      };
    };
    user: true;
    RoundContribution: {
      include: {
        roundCampaign: {
          include: {
            Round: { select: { id: true; title: true; status: true } };
            Campaign: { select: { id: true; title: true; slug: true } };
          };
        };
      };
    };
  };
}>;

export interface ListAdminPaymentsParams {
  page?: number;
  pageSize?: number;
  skip?: number;

  // Filters
  campaignId?: number;
  userAddress?: string;
  status?: string;
  token?: string;
  refundState?: Prisma.EnumPaymentRefundStateFilter;
  type?: Prisma.EnumPaymentTypeFilter;
  pledgeExecutionStatus?: PledgeExecutionStatus;
}

export interface ListAdminPaymentsResult {
  payments: AdminPaymentListItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

/**
 * List payments for admin dashboards with pagination and filters.
 * - Filters supported: campaignId, userAddress, status, token, refundState, type
 * - Sorted by createdAt desc
 */
export async function listAdminPayments({
  page = 1,
  pageSize = 10,
  skip = 0,
  campaignId,
  userAddress,
  status,
  token,
  refundState,
  type,
  pledgeExecutionStatus,
}: ListAdminPaymentsParams = {}): Promise<ListAdminPaymentsResult> {
  const where: Prisma.PaymentWhereInput = {};

  if (typeof campaignId === 'number') {
    where.campaignId = campaignId;
  }
  if (userAddress && userAddress.trim().length > 0) {
    where.user = { address: userAddress };
  }
  if (status && status.trim().length > 0) {
    where.status = status;
  }
  if (token && token.trim().length > 0) {
    where.token = token;
  }
  if (refundState) {
    where.refundState = refundState;
  }
  if (type) {
    where.type = type;
  }
  if (pledgeExecutionStatus && pledgeExecutionStatus.trim().length > 0) {
    where.pledgeExecutionStatus = pledgeExecutionStatus;
  }

  const [items, totalCount] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            campaignAddress: true,
            treasuryAddress: true,
          },
        },
        user: true,
        // Include associated round contributions (if any)
        // Keeping full array to preserve relationship visibility
        RoundContribution: {
          include: {
            roundCampaign: {
              include: {
                Round: { select: { id: true, title: true, status: true } },
                Campaign: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        },
      },
    }),
    db.payment.count({ where }),
  ]);

  return {
    payments: items,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}
