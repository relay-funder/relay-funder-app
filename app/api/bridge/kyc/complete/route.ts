import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BridgeKycCompletePostRequest } from '@/lib/bridge/api/types';

// manual/administrative change of a user's kyc
// TODO: should only be available for admins
export async function POST(request: NextRequest) {
  try {
    const data: BridgeKycCompletePostRequest = await request.json();
    const { userAddress } = data;

    if (!userAddress) {
      return NextResponse.json(
        {
          error: 'Missing user address',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Find user by bridgeCustomerId
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
        },
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (!user.bridgeCustomerId) {
      return NextResponse.json(
        {
          error: 'User profile not found',
        },
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const updatedUser = await prisma.user.updateMany({
      where: { id: user.id },
      data: { isKycCompleted: true },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found or update failed' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'KYC status set to completed',
    });
  } catch (error) {
    console.error('Error completing KYC:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete KYC',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
