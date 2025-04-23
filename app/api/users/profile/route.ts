import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userAddress, firstName, recipientWallet } = await request.json();

        if (!userAddress) {
            return NextResponse.json({ error: 'User address is required' }, { status: 400 });
        }

        // Find or create the user
        const user = await prisma.user.upsert({
            where: { address: userAddress },
            update: {
                firstName,
                ...(recipientWallet && { recipientWallet }),
                updatedAt: new Date(),
            },
            create: {
                address: userAddress,
                firstName,
                recipientWallet,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                address: user.address,
                firstName: user.firstName,
                recipientWallet: user.recipientWallet,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile data' },
            { status: 500 }
        );
    }
} 