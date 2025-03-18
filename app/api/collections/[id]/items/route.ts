import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Add an item to a collection
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { itemId, itemType, userAddress } = body;

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Item ID and type are required' }, { status: 400 });
    }

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    // Check if collection exists and belongs to the user
    const collection = await prisma.collection.findUnique({
      where: {
        id: params.id,
        userId: userAddress,
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Find the campaign by address
    const campaign = await prisma.campaign.findUnique({
      where: {
        campaignAddress: itemId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if campaign already exists in the collection
    const existingItem = await prisma.campaignCollection.findUnique({
      where: {
        campaignId_collectionId: {
          campaignId: campaign.id,
          collectionId: params.id,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Campaign already exists in this collection' }, { status: 400 });
    }

    // Add the campaign to the collection
    const campaignCollection = await prisma.campaignCollection.create({
      data: {
        campaignId: campaign.id,
        collectionId: params.id,
      },
    });

    return NextResponse.json({ item: campaignCollection });
  } catch (error) {
    console.error('Error adding item to collection:', error);
    return NextResponse.json({ error: 'Failed to add item to collection' }, { status: 500 });
  }
}

// Remove an item from a collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { itemId, userAddress } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    // Check if collection exists and belongs to the user
    const collection = await prisma.collection.findUnique({
      where: {
        id: params.id,
        userId: userAddress,
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Find the campaign by address
    const campaign = await prisma.campaign.findUnique({
      where: {
        campaignAddress: itemId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Remove the campaign from the collection
    await prisma.campaignCollection.delete({
      where: {
        campaignId_collectionId: {
          campaignId: campaign.id,
          collectionId: params.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing item from collection:', error);
    return NextResponse.json({ error: 'Failed to remove item from collection' }, { status: 500 });
  }
} 