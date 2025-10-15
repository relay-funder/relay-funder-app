import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiAuthNotAllowed,
  ApiNotFoundError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  CollectionsWithIdParams,
  PutCollectionsWithIdBody,
} from '@/lib/api/types';

// Get a specific collection
export async function GET(req: Request, { params }: CollectionsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const id = (await params).id;
    // Find the collection without requiring user ownership
    const collection = await db.collection.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            campaign: {
              include: {
                media: { where: { state: 'UPLOADED' } },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      throw new ApiNotFoundError('Collection not found');
    }

    // Check if the user is the owner
    const isOwner = collection.userId === session.user.address;

    // Transform the data to match the expected format in the frontend
    const collectionWithDetails = {
      ...collection,
      isOwner,
      items: collection.campaigns.map((campaignCollection) => {
        const campaign = campaignCollection.campaign;
        return {
          itemId: campaign.campaignAddress || String(campaign.id),
          itemType: 'campaign',
          details: {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            slug: campaign.slug,
            media: campaign.media.length
              ? campaign.media
              : [
                  {
                    id: 'placeholder',
                    url: '/images/placeholder',
                    mimeType: 'image/svg',
                  },
                ],
            mediaOrder:
              campaign.media.length && campaign.mediaOrder
                ? campaign.mediaOrder
                : ['placeholder'],
          },
        };
      }),
    };

    return response({ collection: collectionWithDetails });
  } catch (error: unknown) {
    return handleError(error);
  }
}

// Update a collection
export async function PUT(req: Request, { params }: CollectionsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const { id } = await params;
    const body: PutCollectionsWithIdBody = await req.json();
    const { name, description } = body;

    // Check if collection exists and belongs to the user
    const existingCollection = await db.collection.findUnique({
      where: {
        id,
      },
    });

    if (!existingCollection) {
      throw new ApiNotFoundError('Collection not found');
    }
    if (existingCollection.userId !== session.user.address) {
      throw new ApiAuthNotAllowed(
        'User does not have permission to modify collection',
      );
    }

    // Check if new name conflicts with another collection
    if (name && name !== existingCollection.name) {
      const nameConflict = await db.collection.findFirst({
        where: {
          userId: session.user.address,
          name,
          id: { not: id },
        },
      });

      if (nameConflict) {
        throw new ApiParameterError('Collection with this name already exists');
      }
    }

    const updatedCollection = await db.collection.update({
      where: { id },
      data: {
        name: name || existingCollection.name,
        description:
          description !== undefined
            ? description
            : existingCollection.description,
      },
    });

    return response({ collection: updatedCollection });
  } catch (error: unknown) {
    return handleError(error);
  }
}

// Delete a collection
export async function DELETE(
  req: Request,
  { params }: CollectionsWithIdParams,
) {
  try {
    const session = await checkAuth(['user']);
    const { id } = await params;

    // Check if collection exists and belongs to the user
    const existingCollection = await db.collection.findUnique({
      where: {
        id,
      },
    });
    if (!existingCollection) {
      throw new ApiNotFoundError('Collection not found');
    }
    if (existingCollection.userId !== session.user.address) {
      throw new ApiAuthNotAllowed(
        'User does not have permission to modify collection',
      );
    }

    // First delete all campaign associations
    await db.campaignCollection.deleteMany({
      where: {
        collectionId: id,
      },
    });

    // Then delete the collection
    await db.collection.delete({ where: { id } });

    return response({ success: true });
  } catch (error: unknown) {
    return handleError(error);
  }
}
