import { NextRequest, NextResponse } from 'next/server';

import * as nit from "@numbersprotocol/nit";
import { NFTMetadata } from '@/types/numbersprotocol';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // const { assetSignature, file } = body;
        const { assetSignature } = body;

        if (!assetSignature) {
            return NextResponse.json(
                { error: 'Missing asset signature' },
                { status: 400 }
            );
        }

        // 1. Verify the signature first
        const verificationResult = await nit.verifyIntegrityHash(
            assetSignature.integritySha,
            assetSignature.signature
        );

        if (verificationResult !== assetSignature.publicKey) {
            return NextResponse.json(
                { error: 'Asset verification failed' },
                { status: 400 }
            );
        }

        // Generate Numbers ID (NID) for the asset
        const assetNid = await nit.generateNid({
            proofHash: assetSignature.proofHash,
            signature: assetSignature.signature,
            publicKey: assetSignature.publicKey
        });

        // Prepare NFT Metadata
        const nftMetadata: NFTMetadata = {
            name: "Numbers Protocol Asset",
            description: "Asset created and verified through Numbers Protocol",
            image: "", // This would be the IPFS or other decentralized storage URL
            attributes: [
                {
                    trait_type: "Creation Date",
                    value: new Date().toISOString()
                },
                {
                    trait_type: "Creator",
                    value: assetSignature.publicKey
                },
                {
                    trait_type: "Asset Hash",
                    value: assetSignature.proofHash
                },
                {
                    trait_type: "Numbers ID",
                    value: assetNid
                }
            ]
        };

        // Create NFT using Numbers Protocol SDK
        const nftExport = await nit.nft.create({
            nid: assetNid,
            network: "ethereum", // or other supported networks
            contractAddress: process.env.NFT_CONTRACT_ADDRESS || "",
            metadata: nftMetadata,
            options: {
                gasLimit: 500000,
                gasPrice: "auto"
            }
        });

        // 5. Return NFT creation result with NID
        return NextResponse.json({
            success: true,
            nid: assetNid,
            nft: {
                ...nftExport,
                verificationData: {
                    isValid: true,
                    recoveredAddress: verificationResult
                }
            }
        });

    } catch (error) {
        console.error('Error converting to NFT:', error);
        return NextResponse.json(
            { error: 'Error converting to NFT' },
            { status: 500 }
        );
    }
} 