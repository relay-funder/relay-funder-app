//import { createPublicClient, http } from 'viem'
//import { celoAlfajores, celo } from 'viem/chains'
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory';
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

export async function GET() {
  try {
    if (!FACTORY_ADDRESS) {
      throw new Error('Campaign factory address not configured')
    }

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const factory = new ethers.Contract(
      FACTORY_ADDRESS!,
      CampaignInfoFactoryABI,
      provider
    );

    // Get campaign created events
    const filter = factory.filters.CampaignInfoFactoryCampaignCreated();
    const events = await factory.queryFilter(filter);

    // Fetch details for each campaign
    const campaigns = await Promise.all(
      events.map(async (event) => {
        const campaignAddress = event.args?.info;
        const campaign = new ethers.Contract(
          campaignAddress,
          CampaignInfoABI,
          provider
        );

        // Get campaign details
        const [
          owner,
          launchTime,
          deadline,
          goalAmount,
          totalRaised,
        ] = await Promise.all([
          campaign.owner(),
          campaign.getLaunchTime(),
          campaign.getDeadline(),
          campaign.getGoalAmount(),
          campaign.getTotalRaisedAmount(),
        ]);

        return {
          address: campaignAddress,
          owner,
          launchTime: launchTime.toString(),
          deadline: deadline.toString(),
          goalAmount: ethers.utils.formatEther(goalAmount),
          totalRaised: ethers.utils.formatEther(totalRaised),
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