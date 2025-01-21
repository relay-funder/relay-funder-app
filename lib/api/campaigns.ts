import { prisma } from "@/lib/prisma";
import { Campaign, CampaignImage, Payment } from "@prisma/client";

type CampaignWithRelations = Campaign & {
    images: CampaignImage[];
    payments: Payment[];
};

export async function getCampaignBySlug(slug: string): Promise<CampaignWithRelations | null> {
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { slug },
            include: {
                images: true,
                payments: true,
            },
        });

        if (!campaign) {
            return null;
        }

        return campaign;
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return null;
    }
} 