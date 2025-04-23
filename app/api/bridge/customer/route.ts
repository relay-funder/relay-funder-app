import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bridgeService } from '@/lib/bridge-service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userAddress, ...customerData } = data;

    // Create customer in Bridge
    const bridgeCustomer = await bridgeService.createCustomer(customerData);

    // Store the Bridge customer ID in your database with the user
    const user = await prisma.user.upsert({
      where: { address: userAddress },
      update: { bridgeCustomerId: bridgeCustomer.id },
      create: { 
        address: userAddress,
        bridgeCustomerId: bridgeCustomer.id
      },
    });

    return NextResponse.json({ 
      success: true, 
      customerId: bridgeCustomer.id,
      userId: user.id 
    });
  } catch (error) {
    console.error('Bridge customer creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Bridge customer',
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
      select: { bridgeCustomerId: true }
    });

    if (!user?.bridgeCustomerId) {
      return NextResponse.json({ hasCustomer: false });
    }

    return NextResponse.json({ 
      hasCustomer: true,
      customerId: user.bridgeCustomerId 
    });
  } catch (error) {
    console.error('Bridge customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bridge customer' },
      { status: 500 }
    );
  }
} 