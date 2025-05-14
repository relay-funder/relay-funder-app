import { NextResponse } from 'next/server';
import { crowdsplitRequest } from '@/app/api/crowdsplit/utils';

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    // Properly await the params object
    const { id } = context.params;
    
    // Confirm payment in Crowdsplit using the utility function
    const csRes = await crowdsplitRequest(`/api/v1/payments/${id}/confirm`, {
      method: 'POST',
    });
    
    const data = await csRes.json();
    return NextResponse.json(data, { status: csRes.status });
  } catch (error) {
    console.error('Crowdsplit payment confirm error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
