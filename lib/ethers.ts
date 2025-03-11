import { ethers } from 'ethers'
import { AkashicNFTRegistry } from '@/contracts/nftABI/AkashicNFTRegistry';
import { CAMPAIGN_NFT_FACTORY } from '@/lib/constant';
import { AKASHIC_NFT_REGISTRY } from '@/lib/constant';
// import { CampaignNFTabi } from '@/contracts/nftABI/CampaignNFT';
import {CampaignNFTFactory} from '@/contracts/nftABI/CampaignNFTFactory';
// import { NFT_METADATA } from '@/lib/constant';

// Get a provider
export const getProvider = () => {
    // For browser environments
    if (typeof window !== 'undefined' && window.ethereum) {
        return new ethers.providers.Web3Provider(window.ethereum);
    }

    // Fallback to a public provider
    return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
};

// Get a signer
export const getSigner = async () => {
    const provider = getProvider();

    if (provider instanceof ethers.providers.Web3Provider) {
        // Request account access if needed
        await provider.send('eth_requestAccounts', []);
        return provider.getSigner();
    }

    throw new Error('No signer available. Please connect a wallet.');
};

// Get contract instances
export const getRegistryContract = (signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
    const provider = signerOrProvider || getProvider();
    return new ethers.Contract(AKASHIC_NFT_REGISTRY, AkashicNFTRegistry, provider);
};

export const getFactoryContract = (signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
    const provider = signerOrProvider || getProvider();
    return new ethers.Contract(CAMPAIGN_NFT_FACTORY, CampaignNFTFactory, provider);
};

export const getCampaignNFTContract = (address: string, signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
    const provider = signerOrProvider || getProvider();
    return new ethers.Contract(address, CampaignNFTFactory, provider);
};

// Example function to mint NFT using ethers.js directly
export const mintNFTWithEthers = async (
    nftContractAddress: string,
    supporterAddress: string
) => {
    try {
        const signer = await getSigner();
        const nftContract = getCampaignNFTContract(nftContractAddress, signer);

        const tx = await nftContract.mintSupporterNFT(supporterAddress);
        const receipt = await tx.wait();

        // Find the SupporterNFTMinted event
        // @ts-expect-error receipt.events is not typed
        const event = receipt.events?.find((e) => e.event === 'SupporterNFTMinted');

        if (event) {
            const tokenId = event.args.tokenId.toString();
            return { success: true, tokenId };
        }

        return { success: true };
    } catch (error) {
        console.error('Error minting NFT with ethers:', error);
        return { success: false, error };
    }
}; 