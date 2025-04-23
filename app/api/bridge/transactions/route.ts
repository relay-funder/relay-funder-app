import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge-service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      amount, 
      customerId, 
      campaignId, 
      paymentMethod, 
      userAddress,
      isAnonymous = false,
    } = data;

    // Create a buy transaction in Bridge
    const transaction = await bridgeService.buyTransaction({
      amount: Number(amount),
      customer_id: customerId,
      payment_method: paymentMethod,
      currency: "USD", 
      provider: "BRIDGE"
    });

    // Get or create user
    const user = await prisma.user.upsert({
      where: { address: userAddress },
      update: {},
      create: { address: userAddress },
    });

    // Create payment record in your database
    const payment = await prisma.payment.create({
      data: {
        amount: amount.toString(),
        token: "USDC",
        campaignId: parseInt(campaignId),
        userId: user.id,
        isAnonymous,
        status: "pending",
        provider: "BRIDGE",
        externalId: transaction.id,
        metadata: { transaction }
      },
    });

    return NextResponse.json({ 
      success: true, 
      paymentId: payment.id,
      transactionId: transaction.id
    });
  } catch (error) {
    console.error('Bridge transaction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 