import { createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { NextResponse } from 'next/server';
// import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';
import { prisma } from '@/lib/prisma';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

type CombinedCampaignData = {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
  creatorAddress: string;
  status: string;
  transactionHash: string | null;
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  images: {
    id: number;
    imageUrl: string;
    isMainImage: boolean;
  }[];
};

// const handleApiError = (error: unknown, message: string) => {
//   console.error(`${message}:`, error);
//   return NextResponse.json(
//     { error: message },
//     { status: 500 }
//   );

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
    if (!FACTORY_ADDRESS || !RPC_URL) {
      throw new Error('Campaign factory address or RPC URL not configured');
    }

    const client = createPublicClient({
      chain: celoAlfajores,
      transport: http(RPC_URL)
    });

    // First, fetch active and pending campaigns from the database
    const dbCampaigns = await prisma.campaign.findMany({
      where: {
        status: {
          in: ['active', 'pending_approval']
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        fundingGoal: true,
        startTime: true,
        endTime: true,
        creatorAddress: true,
        status: true,
        transactionHash: true,
        campaignAddress: true,
      }
    });

    // Get campaign created events
    const events = await client.getLogs({
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

    // Combine data from events and database
    const combinedCampaigns = dbCampaigns
      .filter(campaign => campaign.transactionHash) // Only include campaigns with transaction hash and address
      .map(dbCampaign => {
        const event = events.find(e => 
          e.transactionHash?.toLowerCase() === dbCampaign.transactionHash?.toLowerCase()
        );

        if (!event || !event.args) {
          console.error('No matching event found for campaign:', dbCampaign.id);
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
          totalRaised: '0' // This will be implemented later with contract calls
        };
      })
      .filter(Boolean); // Remove any null values

    console.log("combinedCampaigns", combinedCampaigns);
    return NextResponse.json({ campaigns: combinedCampaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}