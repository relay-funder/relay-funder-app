import { NextResponse } from 'next/server';
import { crowdsplitRequest } from '@/app/api/crowdsplit/utils';

export async function POST(request: Request) {
  try {
    const paymentData = await request.json();
    
    // Initialize payment in Crowdsplit using the utility function
    const csRes = await crowdsplitRequest('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    
    const data = await csRes.json();
    return NextResponse.json(data, { status: csRes.status });
  } catch (error) {
    console.error('Crowdsplit payment error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 