import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge/service';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentMethodId: string }> },
) {
  const paymentMethodId = parseInt((await params).paymentMethodId);
  const searchParams = request.nextUrl.searchParams;
  const userAddress = searchParams.get('userAddress');
  if (!userAddress) {
    return NextResponse.json(
      { error: 'User address is required' },
      { status: 400 },
    );
  }
  try {
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method not found' },
        { status: 404 },
      );
    }
    if (paymentMethod.userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment Method not accessible by user' },
        { status: 404 },
      );
    }
    if (!paymentMethod.externalId) {
      return NextResponse.json({ paymentMethod }, { status: 200 });
    }
    if (!user.bridgeCustomerId) {
      return NextResponse.json(
        { error: 'User profile incomplete' },
        { status: 404 },
      );
    }
    const bridgePaymentMethod = await bridgeService.getPaymentMethod({
      id: paymentMethod.externalId,
      customerId: user.bridgeCustomerId,
    });
    const details = bridgePaymentMethod?.bankDetails ?? null;

    return NextResponse.json(
      {
        paymentMethod: {
          ...paymentMethod,
          details,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      'Failed to fetch rounds for campaign:',
      (error as unknown as Error).stack,
    );
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 },
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paymentMethodId: string }> },
) {
  const paymentMethodId = parseInt((await params).paymentMethodId);
  const searchParams = request.nextUrl.searchParams;
  const userAddress = searchParams.get('userAddress');
  if (!userAddress) {
    return NextResponse.json(
      { error: 'User address is required' },
      { status: 400 },
    );
  }
  try {
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method not found' },
        { status: 404 },
      );
    }
    if (paymentMethod.userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment Method not accessible by user' },
        { status: 404 },
      );
    }
    if (!paymentMethod.externalId) {
      await prisma.paymentMethod.delete({ where: { id: paymentMethodId } });
      return NextResponse.json({ success: true }, { status: 200 });
    }
    if (!user.bridgeCustomerId) {
      return NextResponse.json(
        { error: 'User profile incomplete' },
        { status: 404 },
      );
    }
    await bridgeService.deletePaymentMethod(
      paymentMethod.externalId,
      user.bridgeCustomerId,
    );
    await prisma.paymentMethod.delete({ where: { id: paymentMethodId } });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      'Failed to remove payment method:',
      (error as unknown as Error).stack,
    );
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 },
    );
  }
}
