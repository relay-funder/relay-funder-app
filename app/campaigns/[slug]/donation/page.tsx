import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DonationForm from "@/components/donation-form"
import ProjectInfo from "@/components/project-info";
import { Campaign } from "@/types/campaign"
import BackButton from '@/app/components/back-button'
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

// Make this a server component by removing 'use client'
async function getCampaign(slug: string): Promise<Campaign> {
    console.log('getCampaign', slug)
    const dbCampaign = await prisma.campaign.findUnique({
        where: { slug },
        include: {
            images: true,
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
        totalRaised: '0'
    }
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const campaign: Campaign = await getCampaign((await params).slug)

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="sticky top-0 z-10 border-b bg-white">
                <header className="container mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <div className="text-sm text-muted-foreground">Donating to</div>
                            <h1 className="text-lg font-semibold">{campaign.title}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-medium">James Farrell</div>
                            <div className="text-sm text-muted-foreground">Connected to Ethereum</div>
                        </div>
                        <Avatar>
                            <AvatarImage src="/placeholder.svg" alt="James Farrell" />
                            <AvatarFallback>JF</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
            </div>
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    <DonationForm campaign={campaign} />
                    <ProjectInfo campaign={campaign} />
                </div>
            </main>
        </div>
    )
}

