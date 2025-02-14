'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SignatureData {
    proofHash: string;
    provider: string;
    signature: string;
    publicKey: string;
    integritySha: string;
}

interface NFTData {
    network: string;
    contractAddress: string;
    tokenId: number;
    metadata: {
        name: string;
        description: string;
        image: string;
        attributes: {
            trait_type: string;
            value: string | number;
        }[];
    };
    verificationData: {
        isValid: boolean;
        recoveredAddress: string;
    };
}

interface NFTResponse {
    success: boolean;
    nid: string;
    nft: NFTData;
}

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [assetSignature, setAssetSignature] = useState<SignatureData | null>(null);
    const [nftData, setNftData] = useState<NFTResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setAssetSignature(null);
            setNftData(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setIsProcessing(true);

            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/numbers-protocol', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process image');
            }

            setAssetSignature(data.signatureData);

            if (data.isValid) {
                toast({
                    title: "Success",
                    description: "Image uploaded and signature created successfully!",
                    variant: "default",
                });
            } else {
                toast({
                    title: "Warning",
                    description: "Image uploaded but signature validation failed.",
                    variant: "destructive",
                });
            }

        } catch (error) {
            console.error("Error processing image:", error);
            toast({
                title: "Error",
                description: "Failed to process image",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerify = async () => {
        if (!assetSignature) return;

        try {
            setIsVerifying(true);

            const response = await fetch('/api/numbers-protocol/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    integritySha: assetSignature.integritySha,
                    signature: assetSignature.signature,
                    publicKey: assetSignature.publicKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify signature');
            }

            if (data.isValid) {
                toast({
                    title: "Verification Success",
                    description: "Signature is valid!",
                    variant: "default",
                });
            } else {
                toast({
                    title: "Verification Failed",
                    description: `Signature is invalid. Expected ${data.expectedAddress}, got ${data.recoveredAddress}`,
                    variant: "destructive",
                });
            }

        } catch (error) {
            console.error("Error verifying signature:", error);
            toast({
                title: "Error",
                description: "Failed to verify signature",
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleConvertToNFT = async () => {
        if (!assetSignature || !selectedFile) return;

        try {
            setIsConverting(true);

            const response = await fetch('/api/numbers-protocol/convert-nft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assetSignature,
                    file: {
                        name: selectedFile.name,
                        type: selectedFile.type,
                        size: selectedFile.size,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to convert to NFT');
            }

            setNftData(data);
            toast({
                title: "Success",
                description: "Asset successfully converted to NFT!",
                variant: "default",
            });

        } catch (error) {
            console.error("Error converting to NFT:", error);
            toast({
                title: "Error",
                description: "Failed to convert asset to NFT",
                variant: "destructive",
            });
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">Upload Image as NFT</h1>
                
                <div className="space-y-4">
                    <div>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mb-4"
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? "Processing..." : "Upload and Sign"}
                        </Button>

                        {assetSignature && (
                            <>
                                <Button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {isVerifying ? "Verifying..." : "Verify Signature"}
                                </Button>

                                <Button
                                    onClick={handleConvertToNFT}
                                    disabled={isConverting}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    {isConverting ? "Converting..." : "Convert to NFT"}
                                </Button>
                            </>
                        )}
                    </div>

                    {assetSignature && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold mb-2">Asset Signature:</h2>
                            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                {JSON.stringify(assetSignature, null, 2)}
                            </pre>
                        </div>
                    )}

                    {nftData && (
                        <>
                            <div className="mt-4">
                                <h2 className="text-lg font-semibold mb-2">Numbers ID (NID):</h2>
                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                    {nftData.nid}
                                </pre>
                            </div>
                            <div className="mt-4">
                                <h2 className="text-lg font-semibold mb-2">NFT Data:</h2>
                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                    {JSON.stringify(nftData.nft, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Upload;