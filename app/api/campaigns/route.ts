import { createPublicClient, http, Abi} from 'viem';
import { celoAlfajores } from 'viem/chains';
import { NextResponse } from 'next/server';
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';

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

const handleApiError = (error: unknown, message: string) => {
  console.error(`${message}:`, error);
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
};

const readCampaignContract = async (client: any, address: `0x${string}`, functionName: string) => {
  return client.readContract({
    address,
    abi: CampaignInfoABI as Abi,
    functionName
  });
};

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
    return handleApiError(error, 'Failed to create campaign');
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const body = await request.json()
    const { status, transactionHash, campaignAddress } = body

    const campaign = await prisma.campaign.update({
      where: {
        id: parseInt(params.campaignId)
      },
      data: {
        status,
        transactionHash,
        campaignAddress
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    return handleApiError(error, 'Failed to update campaign');
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

    // Fetch details for each campaign
    const onChainCampaigns = await Promise.all(
      events.map(async (event) => {
        const campaignAddress = event.args.campaignInfoAddress as `0x${string}`;

        // Ensure campaignAddress is defined
        if (!campaignAddress) {
          throw new Error('Campaign address is undefined');
        }
        console.log('Campaign address:', campaignAddress);
        // Get campaign details using contract reads
        const [
          owner,
          launchTime,
          deadline,
          goalAmount,
          totalRaised,
        ] = await Promise.all([
          readCampaignContract(client, campaignAddress, 'owner'),
          readCampaignContract(client, campaignAddress, 'getLaunchTime'),
          readCampaignContract(client, campaignAddress, 'getDeadline'),
          readCampaignContract(client, campaignAddress, 'getGoalAmount'),
          readCampaignContract(client, campaignAddress, 'getTotalRaisedAmount')
        ]);

        return {
          address: campaignAddress,
          owner,
          launchTime: String(launchTime),
          deadline: String(deadline),
          goalAmount: (Number(goalAmount) / 1e18).toString(),
          totalRaised: (Number(totalRaised) / 1e18).toString(),
        };
      })
    );

    // Fetch all campaigns from the database
    const dbCampaigns = await prisma.campaign.findMany({
      include: {
        images: true
      }
    });

    // Combine the data based on matching creator address and owner
    const combinedCampaigns: CombinedCampaignData[] = onChainCampaigns.map(onChainCampaign => {
      const dbCampaign = dbCampaigns.find(
        db => db.campaignAddress?.toLowerCase() === onChainCampaign.address.toLowerCase()
      );

      if (!dbCampaign) {
        return {
          ...onChainCampaign,
          id: 0,
          title: '',
          description: '',
          fundingGoal: onChainCampaign.goalAmount,
          startTime: new Date(Number(onChainCampaign.launchTime) * 1000),
          endTime: new Date(Number(onChainCampaign.deadline) * 1000),
          creatorAddress: onChainCampaign.owner as string,
          status: 'UNKNOWN',
          transactionHash: null,
          images: []
        } as CombinedCampaignData;
      }

      return {
        ...onChainCampaign,
        ...dbCampaign,
      } as CombinedCampaignData;
    });

    return NextResponse.json({ campaigns: combinedCampaigns });
  } catch (error) {
    return handleApiError(error, 'Error fetching campaigns');
  }
}