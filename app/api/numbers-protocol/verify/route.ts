import { NextRequest, NextResponse } from 'next/server';
import * as nit from "@numbersprotocol/nit";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { integritySha, signature, publicKey } = body;

        if (!integritySha || !signature || !publicKey) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify the signature
        const recoveredAddress = await nit.verifyIntegrityHash(
            integritySha,
            signature
        );

        const isValid = recoveredAddress === publicKey;

        return NextResponse.json({
            isValid,
            recoveredAddress,
            expectedAddress: publicKey
        });

    } catch (error) {
        console.error('Error verifying signature:', error);
        return NextResponse.json(
            { error: 'Error verifying signature' },
            { status: 500 }
        );
    }
} 