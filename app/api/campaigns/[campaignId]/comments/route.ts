import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { campaignId: string } }
) {
    try {
        const { content, userAddress } = await request.json();
        const campaignId = parseInt(params.campaignId);

        // Find the campaign
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // Create the comment
        const comment = await prisma.comment.create({
            data: {
                content,
                userAddress,
                campaignId,
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { campaignId: string } }
) {
    try {
        const campaignId = parseInt(params.campaignId);

        // Get all comments for the campaign
        const comments = await prisma.comment.findMany({
            where: { campaignId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        );
    }
} 