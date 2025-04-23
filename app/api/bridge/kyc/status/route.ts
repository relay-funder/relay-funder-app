import { NextRequest, NextResponse } from 'next/server';
import { BRIDGE_API_URL, BRIDGE_API_KEY } from '@/lib/constant';

export async function GET(request: NextRequest) {
    try {
        const customerId = request.nextUrl.searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        // Call the Bridge API to get the KYC status
        const response = await fetch(`${BRIDGE_API_URL}/api/v1/kyc/${customerId}/status?provider=BRIDGE`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BRIDGE_API_KEY}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get KYC status');
        }
        
        const data = await response.json();
        
        return NextResponse.json({
            status: data.status || 'not_started'
        });
    } catch (error) {
        console.error('KYC status check error:', error);
        return NextResponse.json(
            { error: 'Failed to check KYC status' },
            { status: 500 }
        );
    }
} 