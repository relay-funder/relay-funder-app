'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAkashicRegistry } from '@/hooks/useAkashicRegistry';
import { useCampaignNFT } from '@/hooks/useCampaignNFT';
import { zeroAddress } from 'viem'; // Using viem instead of ethers

// Define a simple ImageUploader component inline since it's missing
const ImageUploader = ({ onImageUploaded }: { onImageUploaded: (uri: string) => void }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue) {
            onImageUploaded(inputValue);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter IPFS URI"
                className="flex-1 px-3 py-2 border rounded"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Set URI
            </button>
        </form>
    );
};

interface CampaignDetailProps {
    campaignId: string;
}

// Define the campaign details type to fix type errors
interface CampaignDetails {
    campaignId: string;
    campaignName: string;
    nftContract: string;
    campaignOwner: string;
    totalMinted: bigint;
    isActive: boolean;
}

export default function CampaignDetail({ campaignId }: CampaignDetailProps) {
    const { address } = useAccount();
    const [imageUri, setImageUri] = useState('');
    const [mintingStatus, setMintingStatus] = useState('');

    // Get campaign details from registry - fix the hook usage
    const campaignDetailsResult = useAkashicRegistry().useCampaignDetails(campaignId);
    const isLoading = campaignDetailsResult.isLoading;

    // Type assertion to fix the campaign details type
    const campaignDetails = campaignDetailsResult.data as CampaignDetails | undefined;

    // Initialize hooks unconditionally to follow React rules
    const nftHookResult = useCampaignNFT(campaignDetails?.nftContract || zeroAddress);

    // Only use the hook result if we have valid campaign details
    const nftHook = campaignDetails ? nftHookResult : null;

    // Check if current user is a supporter
    const isSupporterResult = address ? nftHookResult.useIsSupporter(address) : { data: false };
    const isSupporterData = isSupporterResult.data;

    // Mint NFT functions
    const mintNFTResult = nftHookResult.useMintNFT(address || zeroAddress);
    const { mintNFT, isPending: isMintingNFT } = mintNFTResult;

    const mintNFTWithMetadataResult = nftHookResult.useMintNFTWithMetadata(address || zeroAddress, imageUri);
    const { mintNFTWithMetadata, isPending: isMintingNFTWithMetadata } = mintNFTWithMetadataResult;

    const handleMintNFT = async () => {
        if (!address) {
            setMintingStatus('Please connect your wallet first');
            return;
        }

        if (!campaignDetails) {
            setMintingStatus('Campaign details not available');
            return;
        }

        try {
            setMintingStatus('Minting your NFT...');
            await mintNFT?.();
            setMintingStatus('NFT minted successfully!');
            // Refresh total supporters count
            nftHook?.refetchTotalSupporters();
        } catch (error) {
            console.error('Error minting NFT:', error);
            setMintingStatus('Error minting NFT. Please try again.');
        }
    };

    const handleMintNFTWithMetadata = async () => {
        if (!address) {
            setMintingStatus('Please connect your wallet first');
            return;
        }

        if (!campaignDetails) {
            setMintingStatus('Campaign details not available');
            return;
        }

        if (!imageUri) {
            setMintingStatus('Please provide an image URI');
            return;
        }

        try {
            setMintingStatus('Minting your NFT with custom metadata...');
            await mintNFTWithMetadata?.();
            setMintingStatus('NFT minted successfully!');
            // Refresh total supporters count
            nftHook?.refetchTotalSupporters();
        } catch (error) {
            console.error('Error minting NFT with metadata:', error);
            setMintingStatus('Error minting NFT. Please try again.');
        }
    };

    if (isLoading) {
        return <div className="p-4">Loading campaign details...</div>;
    }

    if (!campaignDetails) {
        return <div className="p-4">Campaign not found.</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{campaignDetails.campaignName}</h1>
            <div className="mb-4">
                <p>Campaign ID: {campaignDetails.campaignId}</p>
                <p>NFT Contract: {campaignDetails.nftContract}</p>
                <p>Campaign Owner: {campaignDetails.campaignOwner}</p>
                <p>Total Minted: {campaignDetails.totalMinted.toString()}</p>
                <p>Status: {campaignDetails.isActive ? 'Active' : 'Inactive'}</p>
            </div>

            {isSupporterData ? (
                <div className="bg-green-100 p-4 rounded mb-4">
                    You already have a supporter NFT for this campaign!
                </div>
            ) : campaignDetails.isActive ? (
                <div className="border p-4 rounded mb-4">
                    <h2 className="text-xl font-bold mb-2">Mint Supporter NFT</h2>

                    <div className="mb-4">
                        <button
                            onClick={handleMintNFT}
                            disabled={isMintingNFT || !mintNFT}
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-300"
                        >
                            {isMintingNFT ? 'Minting...' : 'Mint with Default Metadata'}
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-bold mb-2">Upload Custom Image</h3>
                        <ImageUploader onImageUploaded={(uri: string) => setImageUri(uri)} />
                        {imageUri && (
                            <p className="text-sm text-gray-500 mt-1">
                                IPFS URI: {imageUri}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <button
                            onClick={handleMintNFTWithMetadata}
                            disabled={isMintingNFTWithMetadata || !mintNFTWithMetadata || !imageUri}
                            className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                        >
                            {isMintingNFTWithMetadata ? 'Minting...' : 'Mint with Custom Image'}
                        </button>
                    </div>

                    {mintingStatus && (
                        <div className={`p-2 rounded ${mintingStatus.includes('Error') ? 'bg-red-100' : mintingStatus.includes('success') ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            {mintingStatus}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-yellow-100 p-4 rounded mb-4">
                    This campaign is currently inactive.
                </div>
            )}
        </div>
    );
} 