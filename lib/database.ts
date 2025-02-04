import { Campaign, CampaignDisplay } from "@/types/campaign"
import { prisma } from "./prisma"
import { notFound } from "next/navigation"

export async function getCampaign(slug: string): Promise<Campaign & CampaignDisplay> {
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
            comments: true,
            updates: true,
        },
    })

    if (!dbCampaign) {
        notFound()
    }

    return {
        ...dbCampaign,
        images: dbCampaign.images || [],
        payments: dbCampaign.payments || [],
        comments: dbCampaign.comments || [],
        updates: dbCampaign.updates || [],
        address: dbCampaign.campaignAddress || '',
        owner: dbCampaign.creatorAddress,
        launchTime: Math.floor(new Date(dbCampaign.startTime).getTime() / 1000).toString(),
        deadline: Math.floor(new Date(dbCampaign.endTime).getTime() / 1000).toString(),
        goalAmount: dbCampaign.fundingGoal,
        totalRaised: '0',
        amountRaised: '0'
    } as Campaign & CampaignDisplay
}