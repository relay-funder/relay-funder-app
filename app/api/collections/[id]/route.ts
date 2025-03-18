import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a specific collection
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user address from query params
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    const collection = await prisma.collection.findUnique({
      where: {
        id: params.id,
        userId: userAddress,
      },
      include: {
        campaigns: {
          include: {
            campaign: {
              include: {
                images: true
              }
            }
          }
        }
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Transform the data to match the expected format in the frontend
    const collectionWithDetails = {
      ...collection,
      items: collection.campaigns.map(campaignCollection => {
        const campaign = campaignCollection.campaign;
        return {
          itemId: campaign.campaignAddress || String(campaign.id),
          itemType: 'campaign',
          details: {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            slug: campaign.slug,
            image: campaign.images.find(img => img.isMainImage)?.imageUrl || '/images/placeholder.svg',
          }
        };
      })
    };

    return NextResponse.json({ collection: collectionWithDetails });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

// Update a collection
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, userAddress } = body;

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    // Check if collection exists and belongs to the user
    const existingCollection = await prisma.collection.findUnique({
      where: {
        id: params.id,
        userId: userAddress,
      },
    });

    if (!existingCollection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if new name conflicts with another collection
    if (name && name !== existingCollection.name) {
      const nameConflict = await prisma.collection.findFirst({
        where: {
          userId: userAddress,
          name,
          id: { not: params.id },
        },
      });

      if (nameConflict) {
        return NextResponse.json({ error: 'Collection with this name already exists' }, { status: 400 });
      }
    }

    const updatedCollection = await prisma.collection.update({
      where: {
        id: params.id,
      },
      data: {
        name: name || existingCollection.name,
        description: description !== undefined ? description : existingCollection.description,
      },
    });

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

// Delete a collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user address from query params
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    // Check if collection exists and belongs to the user
    const existingCollection = await prisma.collection.findUnique({
      where: {
        id: params.id,
        userId: userAddress,
      },
    });

    if (!existingCollection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // First delete all campaign associations
    await prisma.campaignCollection.deleteMany({
      where: {
        collectionId: params.id,
      },
    });

    // Then delete the collection
    await prisma.collection.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
} 