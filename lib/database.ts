import { CampaignDisplay } from "@/types/campaign"
import { prisma } from "./prisma"
import { notFound } from "next/navigation"

export async function getCampaign(slug: string): Promise<CampaignDisplay> {
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
        campaignAddress: dbCampaign.campaignAddress,
        transactionHash: dbCampaign.transactionHash,
    } as CampaignDisplay
}