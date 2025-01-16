import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('Received payment data:', JSON.stringify(data, null, 2))
    
    // Get or create user
    const user = await prisma.user.upsert({
      where: { address: data.userAddress },
      update: {},
      create: { address: data.userAddress },
    })

    console.log('Created/found user:', JSON.stringify(user, null, 2))

    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        token: data.token,
        campaignId: data.campaignId,
        userId: user.id,
        isAnonymous: data.isAnonymous,
        status: data.status,
        transactionHash: data.transactionHash,
      },
    })

    console.log('Created payment:', JSON.stringify(payment, null, 2))

    return NextResponse.json({ paymentId: payment.id })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json()
    
    const payment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        status: data.status,
        transactionHash: data.transactionHash,
      },
    })

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 