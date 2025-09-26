import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { ApiParameterError } from '@/lib/api/error';

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

    if (pageSize > 50) {
      throw new ApiParameterError('Maximum page size is 50');
    }

    // Get user's donations with campaign details
    const [donations, totalCount] = await Promise.all([
      db.payment.findMany({
        where: {
          user: { address: session.user.address },
          type: 'BUY',
          status: 'confirmed',
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              fundingGoal: true,
              category: true,
              location: true,
              createdAt: true,
              endTime: true,
              media: {
                where: { state: 'UPLOADED' },
                select: { url: true, mimeType: true },
                take: 1,
              },
            },
          },
          RoundContribution: {
            include: {
              roundCampaign: {
                include: {
                  Round: {
                    select: { id: true, title: true, status: true },
                  },
                },
              },
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.payment.count({
        where: {
          user: { address: session.user.address },
          type: 'BUY',
          status: 'confirmed',
        },
      }),
    ]);

    // Get total donated amount (since amount is stored as String, we need to fetch and sum manually)
    const donatedPayments = await db.payment.findMany({
      where: {
        user: { address: session.user.address },
        type: 'BUY',
        status: 'confirmed',
        token: { in: ['USD', 'USDC'] },
      },
      select: {
        amount: true,
      },
    });

    const totalDonated = donatedPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount || '0');
    }, 0);

    // Get unique campaigns count
    const uniqueCampaignsCount = await db.payment.groupBy({
      by: ['campaignId'],
      where: {
        user: { address: session.user.address },
        type: 'BUY',
        status: 'confirmed',
      },
    });

    const formattedDonations = donations.map((donation) => ({
      id: donation.id,
      amount: parseFloat(donation.amount),
      token: donation.token,
      status: donation.status,
      date: donation.createdAt,
      transactionHash: donation.transactionHash,
      isAnonymous: donation.isAnonymous,
      campaign: {
        ...donation.campaign,
        isCompleted: donation.campaign?.status === 'COMPLETED',
        isOngoing: donation.campaign?.status === 'ACTIVE',
        image: donation.campaign?.media?.[0]?.url || null,
      },
      roundContribution: donation.RoundContribution?.[0]
        ? {
            id: donation.RoundContribution[0].id,
            humanityScore: donation.RoundContribution[0].humanityScore,
            round: donation.RoundContribution[0].roundCampaign.Round,
          }
        : null,
    }));

    return response({
      donations: formattedDonations,
      stats: {
        totalDonated: totalDonated,
        totalCampaigns: uniqueCampaignsCount.length,
        totalDonations: totalCount,
      },
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
