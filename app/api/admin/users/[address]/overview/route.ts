import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getUser } from '@/lib/api/user';
import { db } from '@/server/db';
import type { UserWithAddressParams } from '@/lib/api/types/admin';

export async function GET(_req: Request, { params }: UserWithAddressParams) {
  try {
    await checkAuth(['admin']);

    const { address } = await params;

    // Base user with counts
    const user = await getUser(address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    const userId = user.id;

    const [
      latestPayments,
      latestPaymentMethods,
      latestMedia,
      latestWithdrawalsCreated,
      latestApprovals,
      latestComments,
      latestFavorites,
      latestRoundContributions,
      totalComments,
      totalFavorites,
      totalRoundContributions,
      userCampaigns,
      totalCampaigns,
    ] = await Promise.all([
      db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
        take: 5,
      }),
      db.paymentMethod.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.media.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          caption: true,
          mimeType: true,
          state: true,
          createdAt: true,
          campaignId: true,
          roundId: true,
          updateId: true,
        },
        take: 6,
      }),
      db.withdrawal.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
        take: 5,
      }),
      db.withdrawal.findMany({
        where: { approvedById: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
        take: 5,
      }),
      db.comment.findMany({
        where: { userAddress: address },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
        take: 6,
      }),
      db.favorite.findMany({
        where: { userAddress: address },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
        take: 6,
      }),
      db.roundContribution.findMany({
        where: { payment: { userId } },
        orderBy: { createdAt: 'desc' },
        include: {
          roundCampaign: {
            include: {
              Round: { select: { id: true, title: true, status: true } },
              Campaign: { select: { id: true, title: true, slug: true } },
            },
          },
          payment: { select: { amount: true, token: true } },
        },
        take: 6,
      }),
      db.comment.count({ where: { userAddress: address } }),
      db.favorite.count({ where: { userAddress: address } }),
      db.roundContribution.count({ where: { payment: { userId } } }),
      db.campaign.findMany({
        where: { creatorAddress: address },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          startTime: true,
          endTime: true,
        },
      }),
      db.campaign.count({ where: { creatorAddress: address } }),
    ]);

    // Add campaigns count to user._count (manually computed since no direct relation)
    const userWithCampaignsCount = {
      ...user,
      _count: {
        ...user._count,
        campaigns: totalCampaigns,
      },
    };

    return response({
      user: userWithCampaignsCount,
      latestPayments,
      latestPaymentMethods,
      latestMedia,
      latestWithdrawalsCreated,
      latestApprovals,
      latestComments,
      latestFavorites,
      latestRoundContributions,
      totalComments,
      totalFavorites,
      totalRoundContributions,
      userCampaigns,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
