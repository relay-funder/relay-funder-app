import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CreatePaymentRequest {
  amount: string;
  token: string;
  campaignId: number;
  isAnonymous: boolean;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  type: 'BUY' | 'SELL';
  userAddress: string;
}

interface UpdatePaymentRequest {
  paymentId: number;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
}

export async function POST(req: Request) {
  try {
    const data: CreatePaymentRequest = await req.json();

    // Get or create user
    const user = await prisma.user.upsert({
      where: { address: data.userAddress },
      update: {},
      create: { address: data.userAddress },
    });

    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        token: data.token,
        campaignId: data.campaignId,
        userId: user.id,
        isAnonymous: data.isAnonymous,
        status: data.status,
        transactionHash: data.transactionHash,
        type: data.type,
      },
    });

    return NextResponse.json({ paymentId: payment.id });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const data: UpdatePaymentRequest = await req.json();

    const payment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        status: data.status,
        transactionHash: data.transactionHash,
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
