import { createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { NextResponse } from 'next/server';
// import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';

import { prisma } from '@/lib/prisma';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

// type CombinedCampaignData = {
//   id: number;
//   title: string;
//   description: string;
//   fundingGoal: string;
//   startTime: Date;
//   endTime: Date;
//   creatorAddress: string;
//   status: string;
//   transactionHash: string | null;
//   address: string;
//   owner: string;
//   launchTime: string;
//   deadline: string;
//   goalAmount: string;
//   totalRaised: string;
// };

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

    // First, fetch all campaigns from the database
    const dbCampaigns = await prisma.campaign.findMany({
      where: {
        status: {
          in: ['active', 'pending_approval'] // Only fetch active and pending campaigns
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
    const combinedCampaigns = dbCampaigns.map(dbCampaign => {
      // First check if the campaign has a transaction hash
      if (!dbCampaign.transactionHash) return dbCampaign;

      const event = events.find(e => 
        e.transactionHash?.toLowerCase() === dbCampaign.transactionHash?.toLowerCase()
      );

      if (event && event.args) {
        return {
          ...dbCampaign,
          owner: event.args.owner,
          launchTime: String(event.args.launchTime),
          deadline: String(event.args.deadline),
          goalAmount: (Number(event.args.goalAmount) / 1e18).toString(),
        };
      }
      console.log("dbCampaign", dbCampaign);
      return dbCampaign; // Return the dbCampaign if no event is found
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