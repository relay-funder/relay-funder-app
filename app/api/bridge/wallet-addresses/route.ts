import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge-service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, userAddress, walletAddress } = data;

    if (!customerId || !walletAddress || !userAddress) {
      return NextResponse.json(
        { error: 'Customer ID and wallet address are required' },
        { status: 400 },
      );
    }

    // Call the Bridge API to associate the wallet address with the customer
    const response = await bridgeService.associatWallet({
      customerId,
      walletAddress,
      walletType: 'ETH',
    });

    // Update the user with the recipient wallet address
    await prisma.user.update({
      where: { address: userAddress },
      data: { recipientWallet: walletAddress },
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet address added successfully',
      data: response,
    });
  } catch (error) {
    console.error('Wallet address addition error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add wallet address',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
