import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { response, handleError } from '@/lib/api/response';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const daimoPaymentId = searchParams.get('paymentId');

    if (!daimoPaymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId parameter' },
        { status: 400 },
      );
    }

    const payment = await db.payment.findFirst({
      where: { transactionHash: daimoPaymentId },
      select: {
        id: true,
        transactionHash: true,
        status: true,
        provider: true,
        createdAt: true,
      },
    });

    return response({
      searched: daimoPaymentId,
      found: !!payment,
      payment: payment || null,
    });
  } catch (error) {
    return handleError(error);
  }
}
