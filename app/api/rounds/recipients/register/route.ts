import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// import { ApplicationStatus } from "@/lib/qfInteractions"

export async function POST(request: NextRequest) {
    try {
        const { campaignId, roundId, recipientAddress, onchainRecipientId, walletAddress } = await request.json()

        if (!campaignId || !roundId || !recipientAddress || !onchainRecipientId || !walletAddress) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Verify the user owns the campaign
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                creatorAddress: walletAddress.toLowerCase() 
            },
        })

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: "Campaign not found or you do not have permission" },
                { status: 403 }
            )
        }

        // Verify the round exists and is accepting applications
        const round = await prisma.round.findUnique({
            where: { id: roundId },
        })

        if (!round) {
            return NextResponse.json(
                { success: false, error: "Round not found" },
                { status: 404 }
            )
        }

        // Check if application period is active
        const now = new Date()
        if (now < round.applicationStart || now > round.applicationClose) {
            return NextResponse.json(
                { success: false, error: "Round is not currently accepting applications" },
                { status: 400 }
            )
        }

        // Register the recipient in the database
        await prisma.roundCampaigns.create({ 
            data: {
                campaignId,
                roundId,
                Campaign: { connect: { id: campaignId } },
                Round: { connect: { id: roundId } },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to register recipient:", error)
        return NextResponse.json(
            { success: false, error: "Failed to register recipient" },
            { status: 500 }
        )
    }
} 