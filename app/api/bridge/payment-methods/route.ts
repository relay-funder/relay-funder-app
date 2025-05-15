import { NextRequest, NextResponse } from 'next/server';
import { bridgeService } from '@/lib/bridge/service';
import { prisma } from '@/lib/prisma';
import { BridgePaymentMethodsPostRequest } from '@/lib/bridge/api/types';

// GET endpoint to fetch payment methods from Prisma and enrich from bridge service
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 },
      );
    }

    // Get user ID from the database
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!user.bridgeCustomerId) {
      return NextResponse.json(
        { error: 'User profile incomplete' },
        { status: 400 },
      );
    }

    // Fetch payment methods from Prisma
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
    });
    // Fetch payment details from bridge
    const bridgePaymentMethodDetailsPromises = [];
    for (const paymentMethod of paymentMethods) {
      if (!paymentMethod.externalId) {
        continue;
      }
      bridgePaymentMethodDetailsPromises.push(
        bridgeService.getPaymentMethod({
          id: paymentMethod.externalId,
          customerId: user.bridgeCustomerId,
        }),
      );
    }
    const bridgePaymentMethodDetails = await Promise.all(
      bridgePaymentMethodDetailsPromises,
    );
    return NextResponse.json({
      paymentMethods: paymentMethods.map((paymentMethod) => {
        const bridgeDetails =
          bridgePaymentMethodDetails.find(
            ({ id }) => id === paymentMethod.externalId,
          ) ?? null;
        const details = bridgeDetails?.bankDetails ?? null;
        return {
          ...paymentMethod,
          details,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 },
    );
  }
}

// POST endpoint to add a new payment method
export async function POST(req: NextRequest) {
  try {
    const {
      userAddress,
      type,
      provider,
      bankDetails,
    }: BridgePaymentMethodsPostRequest = await req.json();

    console.log('Received payment method request:', {
      userAddress,
      type,
      provider,
    });

    if (!userAddress || !type || !provider || !bankDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!user.bridgeCustomerId) {
      return NextResponse.json(
        {
          error: 'User not yet a bridge customer, profile information missing',
        },
        { status: 400 },
      );
    }

    try {
      // Ensure we're sending exactly the format Bridge expects

      // Create payment method in Bridge
      const response = await bridgeService.createPaymentMethod({
        customerId: user.bridgeCustomerId,
        type,
        bankDetails,
      });

      if (!response.id) {
        throw new Error('Failed to create payment method in Bridge');
      }

      // Save payment method to Prisma
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          provider,
          externalId: response.id,
          type,
          user: { connect: { id: user.id } },
        },
      });

      return NextResponse.json({ success: true, paymentMethod });
    } catch (bridgeError) {
      console.error('Bridge API error:', bridgeError);
      return NextResponse.json(
        {
          error: `Bridge API error: ${bridgeError instanceof Error ? bridgeError.message : 'Unknown error'}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create payment method',
      },
      { status: 500 },
    );
  }
}
