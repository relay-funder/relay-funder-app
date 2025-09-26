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

    // Get campaign IDs that the user has contributed to
    const contributedCampaigns = await db.payment.findMany({
      where: {
        user: { address: session.user.address },
        type: 'BUY',
        status: 'confirmed',
      },
      select: {
        campaignId: true,
      },
      distinct: ['campaignId'],
    });

    // Get campaign IDs that the user has favorited
    const favoriteCampaigns = await db.favorite.findMany({
      where: {
        userAddress: session.user.address,
      },
      select: {
        campaignId: true,
      },
    });

    // Combine both contributed and favorited campaign IDs (remove duplicates)
    const contributedIds = contributedCampaigns.map(
      (payment) => payment.campaignId,
    );
    const favoriteIds = favoriteCampaigns.map(
      (favorite) => favorite.campaignId,
    );
    const campaignIds = [...new Set([...contributedIds, ...favoriteIds])];

    if (campaignIds.length === 0) {
      // User hasn't contributed to or favorited any campaigns
      return response({
        updates: [],
        pagination: {
          currentPage: page,
          pageSize,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
        },
      });
    }

    // Get updates from campaigns the user has contributed to or favorited
    const [updates, totalCount] = await Promise.all([
      db.campaignUpdate.findMany({
        where: {
          campaignId: { in: campaignIds },
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              category: true,
              location: true,
              creatorAddress: true,
              media: {
                where: { state: 'UPLOADED' },
                select: { url: true, mimeType: true },
                take: 1,
              },
            },
          },
          media: {
            where: { state: 'UPLOADED' },
            select: { url: true, mimeType: true, caption: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.campaignUpdate.count({
        where: {
          campaignId: { in: campaignIds },
        },
      }),
    ]);

    const formattedUpdates = updates.map((update) => ({
      id: update.id,
      title: update.title,
      content: update.content,
      createdAt: update.createdAt,
      updatedAt: update.updatedAt,
      creatorAddress: update.creatorAddress,
      campaign: {
        ...update.campaign,
        image: update.campaign?.media?.[0]?.url || null,
      },
      media: update.media,
    }));

    return response({
      updates: formattedUpdates,
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
