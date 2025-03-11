"use client"

import { useReadContract, useWriteContract } from 'wagmi';
import { CampaignNFTabi } from '@/contracts/nftABI/CampaignNFT';

export function useCampaignNFT(nftContractAddress: string) {
    // Get campaign details
    const { data: campaignId } = useReadContract({
        address: nftContractAddress as `0x${string}`,
        abi: CampaignNFTabi,
        functionName: 'campaignId',
    });

    const { data: campaignName } = useReadContract({
        address: nftContractAddress as `0x${string}`,
        abi: CampaignNFTabi,
        functionName: 'campaignName',
    });

    const { data: totalSupporters, refetch: refetchTotalSupporters } = useReadContract({
        address: nftContractAddress as `0x${string}`,
        abi: CampaignNFTabi,
        functionName: 'getTotalSupporters',
    });

    // Check if an address is a supporter - renamed to follow hook naming convention
    const useIsSupporter = (address: string) => {
        return useReadContract({
            address: nftContractAddress as `0x${string}`,
            abi: CampaignNFTabi,
            functionName: 'isSupporter',
            args: [address],
        });
    };

    // Mint NFT with default URI
    const useMintNFT = (supporterAddress: string) => {
        const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

        const mintNFT = () => {
            writeContract({
                address: nftContractAddress as `0x${string}`,
                abi: CampaignNFTabi,
                functionName: 'mintSupporterNFT',
                args: [supporterAddress],
            });
        };

        return {
            mintNFT,
            isPending,
            isSuccess,
            isError,
            error
        };
    };

    // Mint NFT with custom metadata
    const useMintNFTWithMetadata = (supporterAddress: string, imageUri: string) => {
        const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

        const mintNFTWithMetadata = () => {
            writeContract({
                address: nftContractAddress as `0x${string}`,
                abi: CampaignNFTabi,
                functionName: 'mintSupporterNFTWithMetadata',
                args: [supporterAddress, imageUri],
            });
        };

        return {
            mintNFTWithMetadata,
            isPending,
            isSuccess,
            isError,
            error
        };
    };

    return {
        campaignId,
        campaignName,
        totalSupporters,
        refetchTotalSupporters,
        useIsSupporter, // Renamed to follow hook naming convention
        useMintNFT,
        useMintNFTWithMetadata,
    };
}
