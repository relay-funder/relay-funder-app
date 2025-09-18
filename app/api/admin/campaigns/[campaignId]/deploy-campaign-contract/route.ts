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
    // Note: We pass the campaign data that matches the expected type
    const { txHash, campaignAddress, receipt } = await deployCampaignContract(
      campaignData as any, // Type assertion needed due to getCampaign returning enriched type
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
