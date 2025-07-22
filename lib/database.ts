import {
  Campaign as CampaignType,
  CampaignDisplay,
  DbCampaign,
} from '@/types/campaign';
import { db } from '@/server/db';
import { notFound } from 'next/navigation';

export type CampaignUpdate = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  campaignId: number;
  creatorAddress: string;
};

export async function getCampaignUpdates(
  campaignId: number,
): Promise<CampaignUpdate[]> {
  try {
    const updates = await db.campaignUpdate.findMany({
      where: {
        campaignId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return updates;
  } catch (error) {
    console.error('Error fetching campaign updates:', error);
    return [];
  }
}

export async function getCampaign(
  slug: string,
): Promise<CampaignType & CampaignDisplay> {
  console.log('getCampaign', slug);
  // Get the campaign with all relations
  const dbCampaign = (await db.campaign.findUnique({
    where: { slug },
    include: {
      images: true,
      comments: true,
      updates: true,
      payments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })) as DbCampaign | null;

  if (!dbCampaign) {
    notFound();
  }

  // Calculate total raised from confirmed payments
  const totalRaised =
    dbCampaign.payments?.reduce((accumulator, payment) => {
      // Only count confirmed payments
      if (payment.status !== 'confirmed') {
        return accumulator;
      }
      const value = Number(payment.amount);
      if (isNaN(value)) {
        return accumulator;
      }
      return accumulator + value;
    }, 0) ?? 0;

  // Convert the data to match the expected types
  const result: CampaignType & CampaignDisplay = {
    ...dbCampaign,
    images: dbCampaign.images || [],
    comments: dbCampaign.comments || [],
    updates: dbCampaign.updates || [],
    payments: dbCampaign.payments || [],
    confirmedPayments:
      dbCampaign.payments?.filter((p) => p.status === 'confirmed') || [],
    donationCount:
      dbCampaign.payments?.filter((p) => p.status === 'confirmed').length || 0,
    address: dbCampaign.campaignAddress || '',
    owner: dbCampaign.creatorAddress,
    launchTime: Math.floor(
      new Date(dbCampaign.startTime).getTime() / 1000,
    ).toString(),
    deadline: Math.floor(
      new Date(dbCampaign.endTime).getTime() / 1000,
    ).toString(),
    goalAmount: dbCampaign.fundingGoal,
    totalRaised: totalRaised.toString(),
    amountRaised: totalRaised.toString(),
    location: dbCampaign.location,
  };
  return result;
}
