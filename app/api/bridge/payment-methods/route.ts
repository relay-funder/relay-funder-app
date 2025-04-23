import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge-service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, userAddress, ...paymentMethodData } = data;

    // Add payment method to Bridge
    const paymentMethod = await bridgeService.addPaymentMethod(customerId, paymentMethodData);

    // Store payment method reference in your database
    await prisma.paymentMethod.create({
      data: {
        provider: 'BRIDGE',
        externalId: paymentMethod.id,
        type: paymentMethodData.type,
        user: {
          connect: { address: userAddress }
        },
        details: paymentMethodData
      }
    });

    return NextResponse.json({ 
      success: true, 
      paymentMethodId: paymentMethod.id 
    });
  } catch (error) {
    console.error('Bridge payment method error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add payment method',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userAddress = request.nextUrl.searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    // Get payment methods from database
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { 
        user: { address: userAddress },
        provider: 'BRIDGE'
      }
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Bridge payment methods fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
} 