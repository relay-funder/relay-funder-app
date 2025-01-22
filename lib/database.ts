import { Campaign } from "@/types/campaign"
import { prisma } from "./prisma"
import { notFound } from "next/navigation"

export async function getCampaign(slug: string): Promise<Campaign> {
    console.log('getCampaign', slug)
    const dbCampaign = await prisma.campaign.findUnique({
        where: { slug },
        include: {
            images: true,
            payments: {
                include: {
                    user: true
                }
            },
        },
    })

    if (!dbCampaign) {
        notFound()
    }

    return {
        ...dbCampaign,
        address: dbCampaign.campaignAddress || '',
        owner: dbCampaign.creatorAddress,
        launchTime: Math.floor(dbCampaign.startTime.getTime() / 1000).toString(),
        deadline: Math.floor(dbCampaign.endTime.getTime() / 1000).toString(),
        goalAmount: dbCampaign.fundingGoal,
        totalRaised: '0',
        location: dbCampaign.location,
        status: dbCampaign.status as 'draft' | 'active' | 'closed',
    }
}