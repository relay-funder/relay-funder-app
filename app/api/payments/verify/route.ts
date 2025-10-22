import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { response, handleError } from '@/lib/api/response';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionHash = searchParams.get('transactionHash');

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Missing transactionHash parameter' },
        { status: 400 },
      );
    }

    console.log(
      '🔍 Payment verification requested for transactionHash:',
      transactionHash,
    );

    const payment = await db.payment.findFirst({
      where: { transactionHash },
      select: {
        id: true,
        transactionHash: true,
        status: true,
        provider: true,
        amount: true,
        createdAt: true,
      },
    });

    if (payment) {
      console.log('✅ Payment verification: FOUND', payment);
    } else {
      console.error('🚨 Payment verification: NOT FOUND for', transactionHash);
    }

    return response({
      transactionHash,
      found: !!payment,
      payment: payment || null,
    });
  } catch (error) {
    return handleError(error);
  }
}
