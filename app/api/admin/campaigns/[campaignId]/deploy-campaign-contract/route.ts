import { checkAuth, checkContractAdmin } from '@/lib/api/auth';
import { ApiNotFoundError, ApiIntegrityError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  CampaignsWithIdParams,
  GetCampaignResponseInstance,
} from '@/lib/api/types';
import { getCampaign, updateCampaignTransaction } from '@/lib/api/campaigns';
import {
  deployCampaignContract,
  getDeploymentConfig,
} from '@/lib/api/contract-deployment';

interface DeployCampaignContractResponse {
  success: boolean;
  txHash?: string;
  status?: number;
  campaignAddress?: string;
  campaign?: GetCampaignResponseInstance | null;
}

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignIdOrSlug = (await params).campaignId;

    // Get campaign using existing getCampaign function for validation
    const campaignData = await getCampaign(campaignIdOrSlug);
    if (!campaignData) {
      throw new ApiNotFoundError('Campaign not found');
    }

    // Check if campaign already has an on-chain address
    if (campaignData.campaignAddress) {
      throw new ApiIntegrityError('Campaign contract already deployed');
    }

    // Admin can deploy contracts for campaigns in any status

    // Get deployment configuration
    const deploymentConfig = getDeploymentConfig();

    // Deploy campaign contract using dedicated lib method
    // Convert the enriched campaign data to match the expected Campaign type
    const campaignForDeployment = {
      id: campaignData.id,
      startTime: campaignData.startTime,
      endTime: campaignData.endTime,
      fundingGoal: campaignData.fundingGoal || '0',
      creatorAddress: campaignData.creatorAddress,
      title: campaignData.title,
      description: campaignData.description,
      status: campaignData.status,
      transactionHash: campaignData.transactionHash,
      createdAt: campaignData.createdAt,
      updatedAt: campaignData.updatedAt,
      campaignAddress: campaignData.campaignAddress,
      slug: campaignData.slug,
      location: campaignData.location,
      treasuryAddress: campaignData.treasuryAddress || null,
      category: campaignData.category || null,
      mediaOrder: null, // Default value for mediaOrder
    };

    const { txHash, campaignAddress, receipt } = await deployCampaignContract(
      campaignForDeployment,
      deploymentConfig,
    );

    // Update campaign in database with contract info
    await updateCampaignTransaction({
      id: campaignData.id,
      transactionHash: txHash,
      campaignAddress: campaignAddress ?? undefined,
    });

    return response({
      success: true,
      txHash,
      status: receipt?.status,
      campaignAddress,
      campaign: await getCampaign(campaignData.id),
    } as DeployCampaignContractResponse);
  } catch (error: unknown) {
    console.error('[admin/deploy-campaign-contract] Error', error);
    return handleError(error);
  }
}
