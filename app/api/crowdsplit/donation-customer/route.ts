import { NextRequest, NextResponse } from 'next/server';
import { crowdsplitService } from '@/lib/crowdsplit/service';
import { CrowdsplitDonationCustomerPostRequest } from '@/lib/crowdsplit/api/types';

export async function POST(request: NextRequest) {
  try {
    const { email }: CrowdsplitDonationCustomerPostRequest =
      await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const crowdsplitCustomer = await crowdsplitService.createDonationCustomer({
      email,
    });

    // Access the customer ID from the nested data structure
    const customerId = crowdsplitCustomer.data?.id;

    if (typeof customerId !== 'string') {
      console.error('Expected string id, got:', {
        id: customerId,
        type: typeof customerId,
        fullResponse: crowdsplitCustomer,
      });
      return NextResponse.json(
        { error: 'Crowdsplit API Error', details: 'Invalid customer ID format' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, customerId },
      { status: 200 },
    );
  } catch (error) {
    console.error('Crowdsplit customer error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
