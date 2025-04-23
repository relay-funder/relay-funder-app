import { NextRequest, NextResponse } from 'next/server';
import { BRIDGE_API_URL, BRIDGE_API_KEY } from '@/lib/constant';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { customerId } = data;

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        // Call the Bridge API to initiate KYC
        const response = await fetch(`${BRIDGE_API_URL}/api/v1/kyc/${customerId}/initiate?provider=BRIDGE`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BRIDGE_API_KEY}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to initiate KYC');
        }
        
        const kycData = await response.json();
        
        // Bridge API should return a redirect URL in the response
        const redirectUrl = kycData.redirect_url || `${BRIDGE_API_URL}/kyc/verify/${customerId}`;
        
        return NextResponse.json({ 
            success: true,
            redirectUrl,
            kycData
        });
    } catch (error) {
        console.error('KYC initiation error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to initiate KYC',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 