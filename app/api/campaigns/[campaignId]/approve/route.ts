import { db } from '@/server/db';
import { checkAuth, checkContractAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiIntegrityError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  PostCampaignsWithIdApproveBody,
  CampaignsWithIdParams,
  PostCampaignApproveResponse,
} from '@/lib/api/types';
import { CampaignStatus } from '@/types/campaign';
import { getCampaign } from '@/lib/api/campaigns';
import { createTreasuryManager } from '@/lib/treasury/interface';
import { ethers } from 'ethers';
import { chainConfig } from '@/lib/web3';

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    const { treasuryAddress }: PostCampaignsWithIdApproveBody =
      await req.json();

    if (!treasuryAddress) {
      throw new ApiParameterError('treasuryAddress is required');
    }
    // Get campaign info from database
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (!campaign.campaignAddress) {
      throw new ApiIntegrityError('Campaign address not found');
    }

    // Update campaign status and treasury address in database
    await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.ACTIVE,
        treasuryAddress,
      },
    });

    // Configure treasury with campaign parameters
    try {
      const treasuryManager = await createTreasuryManager();
      const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;

      if (platformAdminKey) {
        const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
        const platformAdminSigner = new ethers.Wallet(
          platformAdminKey,
          provider,
        );

        const configResult = await treasuryManager.configureTreasury(
          treasuryAddress,
          campaignId,
          platformAdminSigner,
        );

        if (!configResult.success) {
          console.error('Treasury configuration failed:', configResult.error);
          // Continue with approval even if configuration fails
        }
      }
    } catch (configError) {
      console.error('Error during treasury configuration:', configError);
      // Don't fail the approval if configuration fails - treasury can be configured later
    }

    return response({
      campaign: await getCampaign(campaignId),
    } as PostCampaignApproveResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
