import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { campaignId, title, content, creatorAddress } = body

        if (!campaignId || !title || !content || !creatorAddress) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify the creator is the campaign owner
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        })

        if (!campaign || campaign.creatorAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const update = await prisma.campaignUpdate.create({
            data: {
                title,
                content,
                campaignId: campaignId,
                creatorAddress
            }
        })

        return NextResponse.json(update)
    } catch (error) {
        console.error('Failed to create campaign update:', error)
        return NextResponse.json(
            { error: 'Failed to create campaign update' },
            { status: 500 }
        )
    }
} 