"use client"

import { useWriteContract, useReadContract } from 'wagmi'
import { AKASHIC_NFT_REGISTRY } from "@/lib/constant";
import { AkashicNFTRegistry } from "@/contracts/nftABI/AkashicNFTRegistry";

export function useAkashicRegistry() {
    // Get all active campaigns
    const { data: activeCampaigns, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useReadContract({
        address: AKASHIC_NFT_REGISTRY as `0x${string}`,
        abi: AkashicNFTRegistry,
        functionName: 'getActiveCampaigns',
    });

    // Get campaign details
    const useCampaignDetails = (campaignId: string) => {
        return useReadContract({
            address: AKASHIC_NFT_REGISTRY as `0x${string}`,
            abi: AkashicNFTRegistry,
            functionName: 'getCampaignNFTDetails',
            args: [campaignId],
        });
    };

    // Update campaign NFT
    const useUpdateCampaign = (campaignId: string, isActive: boolean, totalMinted: bigint) => {
        const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

        const updateCampaign = () => {
            writeContract({
                address: AKASHIC_NFT_REGISTRY as `0x${string}`,
                abi: AkashicNFTRegistry,
                functionName: 'updateCampaignNFT',
                args: [campaignId, isActive, totalMinted],
            });
        };

        return {
            updateCampaign,
            isPending,
            isSuccess,
            isError,
            error
        };
    };

    return {
        activeCampaigns,
        isLoadingCampaigns,
        refetchCampaigns,
        useCampaignDetails,
        useUpdateCampaign,
    };
}
