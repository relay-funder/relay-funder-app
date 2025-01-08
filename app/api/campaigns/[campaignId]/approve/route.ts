import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAddress } from '@/lib/constant'
import { ethers } from 'ethers'
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams'
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory'

// Platform configuration from environment variables
const platformConfig = {
    treasuryFactoryAddress: process.env.NEXT_PUBLIC_TREASURY_FACTORY as string,
    globalParamsAddress: process.env.NEXT_PUBLIC_Global_Params as string,
    platformBytes: process.env.NEXT_PUBLIC_PLATFORM_HASH as string,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
}

interface ApproveCampaignParams {
    treasuryFactoryAddress: string;
    globalParamsAddress: string;
    platformBytes: string;
    campaignInfoAddress: string;
    bytecodeIndex?: number;
    signer: ethers.Signer;
}

interface TreasuryDeployedEvent {
    event: string;
    args: {
        treasuryAddress: string;
        campaignInfo: string;
    };
}

export async function POST(
    request: Request,
    { params }: { params: { campaignId: string } }
) {
    try {
        const { adminAddress: requestAddress } = await request.json()
        const campaignId = parseInt(params.campaignId)

        // Verify required environment variables
        if (!process.env.PLATFORM_ADMIN_PRIVATE_KEY) {
            throw new Error('Missing PLATFORM_ADMIN_PRIVATE_KEY environment variable')
        }

        if (!platformConfig.treasuryFactoryAddress || !platformConfig.globalParamsAddress || !platformConfig.platformBytes) {
            throw new Error('Missing required platform configuration')
        }

        // Verify admin
        if (!requestAddress || requestAddress.toLowerCase() !== adminAddress?.toLowerCase()) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access only' },
                { status: 401 }
            )
        }

        // Get campaign info from database
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        })

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            )
        }

        if (!campaign.contractAddress) {
            return NextResponse.json(
                { error: 'Campaign contract address not found' },
                { status: 400 }
            )
        }

        // Setup provider and signer
        const provider = new ethers.providers.JsonRpcProvider(platformConfig.rpcUrl)
        const adminWallet = new ethers.Wallet(process.env.PLATFORM_ADMIN_PRIVATE_KEY, provider)

        // Verify campaign status on blockchain
        const result = await approveCampaign({
            treasuryFactoryAddress: platformConfig.treasuryFactoryAddress,
            globalParamsAddress: platformConfig.globalParamsAddress,
            platformBytes: platformConfig.platformBytes,
            campaignInfoAddress: campaign.contractAddress,
            signer: adminWallet
        })

        // Update campaign status and treasury address in database
        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: 'active',
                treasuryAddress: result.treasuryAddress
            }
        })

        return NextResponse.json({ 
            campaign: updatedCampaign,
            transaction: result.transactionHash
        })
    } catch (error) {
        console.error('Error approving campaign:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to approve campaign'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
} 

async function approveCampaign({
    treasuryFactoryAddress,
    globalParamsAddress,
    platformBytes,
    campaignInfoAddress,
    bytecodeIndex = 0,
    signer
}: ApproveCampaignParams) {
    try {
        // First verify that the signer is actually the PLATFORM_ADMIN
        const globalParams = new ethers.Contract(
            globalParamsAddress,
            GlobalParamsABI,
            signer
        );

        const platformAdmin = await globalParams.getPlatformAdminAddress(platformBytes);
        const signerAddress = await signer.getAddress();

        if (platformAdmin.toLowerCase() !== signerAddress.toLowerCase()) {
            throw new Error('Signer is not the PLATFORM_ADMIN for this platform');
        }

        // Initialize TreasuryFactory contract
        const treasuryFactory = new ethers.Contract(
            treasuryFactoryAddress,
            TreasuryFactoryABI,
            signer
        );

        // Deploy treasury for the campaign
        const tx = await treasuryFactory.deploy(
            platformBytes,
            bytecodeIndex,
            campaignInfoAddress
        );

        const receipt = await tx.wait();

        const deployEvent = receipt.events?.find(
            (e: TreasuryDeployedEvent) => e.event === 'TreasuryFactoryTreasuryDeployed'
        );

        if (!deployEvent) {
            throw new Error('Treasury deployment event not found');
        }

        const treasuryAddress = deployEvent.args.treasuryAddress;

        return {
            success: true,
            treasuryAddress,
            transactionHash: receipt.transactionHash
        };

    } catch (error) {
        console.error('Error approving campaign:', error);
        throw error;
    }
}
