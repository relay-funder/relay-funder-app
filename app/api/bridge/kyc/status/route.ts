import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge/service';

interface KycStatusData {
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const userAddress = request.nextUrl.searchParams.get('userAddress');

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

    try {
      // Get the KYC status from Bridge API
      const statusData: KycStatusData = (await bridgeService.getKycStatus(
        user.bridgeCustomerId,
      )) as KycStatusData;
      const status = statusData.status || 'pending';

      // If KYC is completed according to Bridge, update our database
      if (status === 'completed' && !user.isKycCompleted) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isKycCompleted: true },
        });
      }

      return NextResponse.json(
        {
          status,
          customerId: user.bridgeCustomerId,
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (bridgeError) {
      console.error('Bridge API error:', bridgeError);
      // Still return valid JSON even if Bridge API fails
      return NextResponse.json(
        {
          status: user.isKycCompleted ? 'completed' : 'pending',
          customerId: user.bridgeCustomerId,
          bridgeError:
            bridgeError instanceof Error
              ? bridgeError.message
              : String(bridgeError),
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    console.error('Error checking KYC status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check KYC status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
