import { createPublicClient, http, getContract } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { NextResponse } from 'next/server';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';

const CAMPAIGN_INFO_FACTORY = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

export async function GET() {
  try {
    if (!CAMPAIGN_INFO_FACTORY || !RPC_URL) {
      throw new Error('Campaign factory address or RPC URL not configured');
    }

    const client = createPublicClient({
      chain: celoAlfajores,
      transport: http(RPC_URL)
    });

    // Get campaign created events
    const events = await client.getLogs({
      address: CAMPAIGN_INFO_FACTORY as `0x${string}`,
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
    const campaigns = await Promise.all(
      events.map(async (event) => {
        const campaignAddress = event.args.campaignInfoAddress;
        
        // Get campaign details using contract reads
        const [
          owner,
          launchTime,
          deadline,
          goalAmount,
          totalRaised,
        ] = await Promise.all([
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI,
            functionName: 'owner'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI,
            functionName: 'getLaunchTime'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI,
            functionName: 'getDeadline'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI,
            functionName: 'getGoalAmount'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI,
            functionName: 'getTotalRaisedAmount'
          })
        ]);

        return {
          address: campaignAddress,
          owner,
          launchTime: launchTime.toString(),
          deadline: deadline.toString(),
          goalAmount: (Number(goalAmount) / 1e18).toString(),
          totalRaised: (Number(totalRaised) / 1e18).toString(),
        };
      })
    );

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}