import { createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DbCampaign } from '@/types/campaign'
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

async function getPublicClient() {
  if (!FACTORY_ADDRESS || !RPC_URL) {
    throw new Error('Campaign factory address or RPC URL not configured');
  }
  
  return createPublicClient({
    chain: celoAlfajores,
    transport: http(RPC_URL),
    batch: {
      multicall: true
    }
  });
}

async function getActiveCampaigns() {
  return prisma.campaign.findMany({
    where: {
      status: {
        in: ['active', 'pending_approval']
      }
    },
    include: {
      images: true
    }
  });
}

async function getCampaignCreatedEvents(client: ReturnType<typeof createPublicClient>) {
  return client.getLogs({
    address: FACTORY_ADDRESS as `0x${string}`,
    event: {
      type: 'event',
      name: 'CampaignInfoFactoryCampaignCreated',
      inputs: [
        { type: 'bytes32', name: 'identifierHash', indexed: true },
        { type: 'address', name: 'campaignInfoAddress', indexed: true }
      ]
    },
    fromBlock: 0n,
    toBlock: 'latest'
  });
}

type CampaignCreatedEvent = {
  args: {
    identifierHash: `0x${string}`,
    campaignInfoAddress: `0x${string}`
  }
}

function formatCampaignData(dbCampaign: DbCampaign, event: CampaignCreatedEvent | undefined) {
  if (!event || !event.args) {
    console.error('No matching event found for campaign:', {
      campaignId: dbCampaign.id,
      campaignAddress: dbCampaign.campaignAddress
    });
    return null;
  }

  return {
    id: dbCampaign.id,
    title: dbCampaign.title,
    description: dbCampaign.description,
    status: dbCampaign.status,
    address: dbCampaign.campaignAddress,
    owner: dbCampaign.creatorAddress,
    launchTime: Math.floor(new Date(dbCampaign.startTime).getTime() / 1000).toString(),
    deadline: Math.floor(new Date(dbCampaign.endTime).getTime() / 1000).toString(),
    goalAmount: dbCampaign.fundingGoal,
    totalRaised: '0',
    images: dbCampaign.images
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      fundingGoal,
      startTime,
      endTime,
      creatorAddress,
      status
    } = body

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        fundingGoal,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creatorAddress,
        status
      },
    })

    return NextResponse.json({ campaignId: campaign.id }, { status: 201 })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const body = await request.json()
    const { status, transactionHash, campaignAddress, campaignId } = body

    const campaign = await prisma.campaign.update({
      where: {
        id: parseInt(campaignId)
      },
      data: {
        status,
        transactionHash,
        campaignAddress
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = await getPublicClient();
    const [dbCampaigns, events] = await Promise.all([
      getActiveCampaigns(),
      // @ts-expect-error - Ignoring viem type mismatch for chain compatibility
      getCampaignCreatedEvents(client)
    ]);

    const combinedCampaigns = dbCampaigns
      .filter((campaign) => campaign.transactionHash)
      .map((dbCampaign) => {
        const event = events.find(onChainCampaign =>
          onChainCampaign.args?.campaignInfoAddress?.toLowerCase() === dbCampaign.campaignAddress?.toLowerCase()
        ) as CampaignCreatedEvent | undefined;
        return formatCampaignData(dbCampaign, event);
      })
      .filter(Boolean);

    return NextResponse.json({ campaigns: combinedCampaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}