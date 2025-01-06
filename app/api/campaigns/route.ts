import { createPublicClient, http } from 'viem';
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

export async function GET() {
  try {
    if (!FACTORY_ADDRESS || !RPC_URL) {
      throw new Error('Campaign factory address or RPC URL not configured');
    }

    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creatorAddress');
    const view = searchParams.get('view'); // 'dashboard' or 'list'

    const client = createPublicClient({
      chain: celoAlfajores,
      transport: http(RPC_URL)
    });

    // First, fetch campaigns from the database based on view type
    const dbCampaigns = await prisma.campaign.findMany({
      where: {
        ...(creatorAddress ? { creatorAddress } : {}),
        // For campaign list view, only show active and pending_approval campaigns
        // For dashboard view, show all statuses
        status: view !== 'dashboard' ? {
          in: ['active', 'pending_approval']
        } : {
          in: ['draft', 'pending_approval', 'active', 'failed', 'completed']
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
          { type: 'address', name: 'campaignInfoAddress', indexed: true },
          { type: 'address', name: 'owner' },
          { type: 'uint256', name: 'launchTime' },
          { type: 'uint256', name: 'deadline' },
          { type: 'uint256', name: 'goalAmount' }
        ]
      },
      fromBlock: 0n,
      toBlock: 'latest'
    });

    // Combine data from events and database
    const combinedCampaigns = dbCampaigns.map(dbCampaign => {
      // First check if the campaign has a transaction hash
      if (!dbCampaign.transactionHash) {
        // For campaigns without transaction hash (draft, etc), use database values
        return {
          ...dbCampaign,
          address: dbCampaign.campaignAddress || '',
          owner: dbCampaign.creatorAddress,
          launchTime: Math.floor(new Date(dbCampaign.startTime).getTime() / 1000).toString(),
          deadline: Math.floor(new Date(dbCampaign.endTime).getTime() / 1000).toString(),
          goalAmount: dbCampaign.fundingGoal,
          totalRaised: '0'
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

      const event = events.find(e => 
        e.transactionHash?.toLowerCase() === dbCampaign.transactionHash?.toLowerCase()
      );

      if (event && event.args) {
        return {
          ...dbCampaign,
          address: dbCampaign.campaignAddress || '',
          owner: event.args.owner || dbCampaign.creatorAddress,
          launchTime: String(event.args.launchTime || Math.floor(new Date(dbCampaign.startTime).getTime() / 1000)),
          deadline: String(event.args.deadline || Math.floor(new Date(dbCampaign.endTime).getTime() / 1000)),
          goalAmount: event.args.goalAmount ? (Number(event.args.goalAmount) / 1e18).toString() : dbCampaign.fundingGoal,
          totalRaised: '0' // We'll implement this later when we have the contract
        };
      }

      // Fallback to database values if event parsing fails
      return {
        ...dbCampaign,
        address: dbCampaign.campaignAddress || '',
        owner: dbCampaign.creatorAddress,
        launchTime: Math.floor(new Date(dbCampaign.startTime).getTime() / 1000).toString(),
        deadline: Math.floor(new Date(dbCampaign.endTime).getTime() / 1000).toString(),
        goalAmount: dbCampaign.fundingGoal,
        totalRaised: '0'
      };
    });


    // Get campaign details from blockchain
    // const approvedCampaigns = await Promise.all(
    //   dbCampaigns
    //     .filter(campaign => campaign.transactionHash) // Only process campaigns with txn hash
    //     .map(async (campaign) => {
    //       console.log("campaign before campaignAddress", campaign);
    //       const campaignAddress = campaign.campaignAddress as `0x${string}`;
    //       console.log("campaignAddress", campaignAddress);
    //       try {
    //         const [
    //           owner,
    //           launchTime,
    //           deadline,
    //           goalAmount,
    //           totalRaised,
    //         ] = await Promise.all([
    //           client.readContract({
    //             address: campaignAddress,
    //             abi: CampaignInfoABI as Abi,
    //             functionName: 'owner'
    //           }),
    //           client.readContract({
    //             address: campaignAddress,
    //             abi: CampaignInfoABI as Abi,
    //             functionName: 'getLaunchTime'
    //           }),
    //           client.readContract({
    //             address: campaignAddress,
    //             abi: CampaignInfoABI as Abi,
    //             functionName: 'getDeadline'
    //           }),
    //           client.readContract({
    //             address: campaignAddress,
    //             abi: CampaignInfoABI as Abi,
    //             functionName: 'getGoalAmount'
    //           }),
    //           client.readContract({
    //             address: campaignAddress,
    //             abi: CampaignInfoABI as Abi,
    //             functionName: 'getTotalRaisedAmount'
    //           })
    //         ]);

    //         return {
    //           ...campaign,
    //           address: campaignAddress,
    //           owner: owner as string,
    //           launchTime: String(launchTime),
    //           deadline: String(deadline),
    //           goalAmount: (Number(goalAmount) / 1e18).toString(),
    //           totalRaised: (Number(totalRaised) / 1e18).toString(),
    //         };
    //       } catch (error) {
    //         console.error(`Error fetching data for campaign ${campaignAddress}:`, error);
    //         return null;
    //       }
    //     })
    // );
    // const validCampaigns = onChainCampaigns.filter(campaign => campaign !== null);

    console.log('Final combined campaigns:', combinedCampaigns);


    return NextResponse.json({ campaigns: combinedCampaigns });
  } catch (error) {
    return handleApiError(error, 'Error fetching campaigns');
  }
}