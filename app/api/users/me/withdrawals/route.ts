import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';

export async function GET(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || '10'),
      50,
    );
    const skip = (page - 1) * pageSize;

    const user = await db.user.findUnique({
      where: { address: session.user.address },
    });

    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    const userCampaigns = await db.campaign.findMany({
      where: { creatorAddress: user.address },
      select: { id: true },
    });

    const campaignIds = userCampaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      return response({
        withdrawals: [],
        pagination: {
          currentPage: page,
          pageSize,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
        },
      });
    }

    const whereClause = {
      campaignId: { in: campaignIds },
      requestType: 'WITHDRAWAL_AMOUNT' as const,
    };

    const [withdrawals, totalCount] = await Promise.all([
      db.withdrawal.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      db.withdrawal.count({ where: whereClause }),
    ]);

    return response({
      withdrawals,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
        hasMore: skip + pageSize < totalCount,
      },
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
