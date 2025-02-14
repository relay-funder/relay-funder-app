import { NextRequest, NextResponse } from 'next/server';
import * as nit from "@numbersprotocol/nit";
import { ethers } from "ethers";
import crypto, { BinaryLike } from "crypto";
import { IntegrityProof, SignatureData } from '@/types/numbersprotocol';


async function calculateSHA256(buffer: Buffer): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(buffer as unknown as BinaryLike);
    return hash.digest('hex');
}

async function generateIntegritySha(proofMetadata: IntegrityProof): Promise<string> {
    const data = JSON.stringify(proofMetadata, null, 2);
    const dataBytes = Buffer.from(data);
    return await nit.getIntegrityHash(dataBytes);
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Calculate proof hash
        const proofHash = await calculateSHA256(buffer);

        // Create integrity proof
        const integrityProof: IntegrityProof = {
            proof_hash: proofHash,
            asset_mime_type: file.type || "application/octet-stream",
            created_at: Math.floor(Date.now() / 1000),
        };

        // Generate integrity SHA
        const integritySha = await generateIntegritySha(integrityProof);

        // For demo purposes, using a random wallet
        // In production, you should use a proper wallet connection
        const wallet = ethers.Wallet.createRandom();
        const signature = await nit.signIntegrityHash(integritySha, wallet);

        const signatureData: SignatureData = {
            proofHash,
            provider: "AkashicCaptureSignatureProvider",
            signature,
            publicKey: await wallet.getAddress(),
            integritySha,
        };

        // Verify the signature
        const recoveredAddress = await nit.verifyIntegrityHash(
            integritySha,
            signature
        );

      

        console.log("recoveredAddress", recoveredAddress)

        return NextResponse.json({
            signatureData,
            isValid: recoveredAddress === wallet.address
        });

    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
            { error: 'Error processing file' },
            { status: 500 }
        );
    }
} 