import { createPublicClient, http, Abi} from 'viem';
import { celoAlfajores } from 'viem/chains';
import { NextResponse } from 'next/server';
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

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
    const campaigns = await Promise.all(
      events.map(async (event) => {
        const campaignAddress = event.args.campaignInfoAddress as `0x${string}`;

        // Ensure campaignAddress is defined
        if (!campaignAddress) {
          throw new Error('Campaign address is undefined');
        }

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
            abi: CampaignInfoABI as Abi,
            functionName: 'owner'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI as Abi,
            functionName: 'getLaunchTime'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI as Abi,
            functionName: 'getDeadline'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI as Abi,
            functionName: 'getGoalAmount'
          }),
          client.readContract({
            address: campaignAddress,
            abi: CampaignInfoABI as Abi,
            functionName: 'getTotalRaisedAmount'
          })
        ]);

        return {
          address: campaignAddress,
          owner,
          launchTime: (String(launchTime)),
          deadline: (String(deadline)),
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