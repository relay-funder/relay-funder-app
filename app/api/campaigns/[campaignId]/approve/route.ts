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
} from '@/lib/api/types';
import { CampaignStatus } from '@/types/campaign';

interface CampaignUpdateData {
  status: CampaignStatus;
  treasuryAddress?: string;
  cryptoTreasuryAddress?: string;
  paymentTreasuryAddress?: string;
  treasuryMode?: 'DUAL' | 'CRYPTO_ONLY' | 'PAYMENT_ONLY' | 'LEGACY';
}

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }

    const body: PostCampaignsWithIdApproveBody = await req.json();
    
    // Support both legacy single treasury and new dual treasury formats
    const { 
      treasuryAddress, // Legacy support
      cryptoTreasuryAddress,
      paymentTreasuryAddress,
      cryptoTreasuryTx,
      paymentTreasuryTx
    } = body;

    // Validate that we have at least one treasury address
    if (!treasuryAddress && !cryptoTreasuryAddress && !paymentTreasuryAddress) {
      throw new ApiParameterError('At least one treasury address is required');
    }

    // Get campaign info from database
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (!campaign.campaignAddress) {
      throw new ApiIntegrityError('Campaign address not found - CampaignInfo contract must be deployed first');
    }

    console.log('Approving campaign with dual treasury deployment:', {
      campaignId,
      campaignAddress: campaign.campaignAddress,
      cryptoTreasuryAddress,
      paymentTreasuryAddress,
    });

    // Determine treasury mode and update data
    let updateData: CampaignUpdateData = {
      status: CampaignStatus.ACTIVE,
    };

    if (cryptoTreasuryAddress && paymentTreasuryAddress) {
      // Dual treasury deployment
      updateData = {
        ...updateData,
        cryptoTreasuryAddress,
        paymentTreasuryAddress,
        treasuryAddress: cryptoTreasuryAddress, // Set crypto as primary for backward compatibility
        treasuryMode: 'DUAL',
      };
      console.log('✅ Dual treasury deployment detected');
    } else if (cryptoTreasuryAddress) {
      // Crypto-only deployment
      updateData = {
        ...updateData,
        cryptoTreasuryAddress,
        treasuryAddress: cryptoTreasuryAddress,
        treasuryMode: 'CRYPTO_ONLY',
      };
      console.log('✅ Crypto-only treasury deployment detected');
    } else if (paymentTreasuryAddress) {
      // Payment-only deployment
      updateData = {
        ...updateData,
        paymentTreasuryAddress,
        treasuryAddress: paymentTreasuryAddress,
        treasuryMode: 'PAYMENT_ONLY',
      };
      console.log('✅ Payment-only treasury deployment detected');
    } else if (treasuryAddress) {
      // Legacy single treasury
      updateData = {
        ...updateData,
        treasuryAddress,
        treasuryMode: 'LEGACY',
      };
      console.log('✅ Legacy treasury deployment detected');
    }

    // Update campaign status and treasury addresses in database
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    console.log('✅ Campaign approved successfully:', {
      id: updatedCampaign.id,
      status: updatedCampaign.status,
      treasuryMode: updatedCampaign.treasuryMode,
      cryptoTreasuryAddress: updatedCampaign.cryptoTreasuryAddress,
      paymentTreasuryAddress: updatedCampaign.paymentTreasuryAddress,
    });

    return response({
      campaign: updatedCampaign,
      // Include transaction hashes in response for tracking
      transactions: {
        cryptoTreasuryTx,
        paymentTreasuryTx,
      },
    });
  } catch (error: unknown) {
    console.error('Campaign approval failed:', error);
    return handleError(error);
  }
}
