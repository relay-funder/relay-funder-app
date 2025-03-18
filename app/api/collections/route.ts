import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all collections for the current user
export async function GET(req: NextRequest) {
  try {
    // Get user address from query params or headers
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    const collections = await prisma.collection.findMany({
      where: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format in the frontend
    const collectionsWithDetails = collections.map(collection => {
      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        createdAt: collection.createdAt,
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
    });

    return NextResponse.json({ collections: collectionsWithDetails });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

// Create a new collection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, userAddress } = body;

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    // Check if collection with this name already exists for the user
    const existingCollection = await prisma.collection.findFirst({
      where: {
        userId: userAddress,
        name,
      },
    });

    if (existingCollection) {
      return NextResponse.json({ error: 'Collection with this name already exists' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description: description || '',
        userId: userAddress,
      },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
} 