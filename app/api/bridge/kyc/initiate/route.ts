import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge/service';
import { BridgeKycInitiatePostRequest } from '@/lib/bridge/api/types';

// request a initiate-url for the KYC process, returns a url that the client needs to redirect to
export async function POST(request: NextRequest) {
  try {
    const data: BridgeKycInitiatePostRequest = await request.json();
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

    // Call the Bridge API to initiate KYC
    const kycData = await bridgeService.initiateKyc(user.bridgeCustomerId);

    // Bridge API should return a redirect URL in the response
    // The key name may vary based on actual Bridge API response format
    const redirectUrl = kycData.redirect_url || kycData.redirectUrl;

    if (!redirectUrl) {
      throw new Error('No redirect URL found in Bridge API response');
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
    });
  } catch (error) {
    console.error('Error initiating KYC:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate KYC',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
