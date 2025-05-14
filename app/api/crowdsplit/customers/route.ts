import { NextRequest, NextResponse } from 'next/server';
import { crowdsplitRequest } from '@/app/api/crowdsplit/utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Create customer in Crowdsplit using the utility function
    const csRes = await crowdsplitRequest('/api/v1/customers', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    const data = await csRes.json();
    return NextResponse.json(data, { status: csRes.status });
  } catch (error) {
    console.error('Crowdsplit customer error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
