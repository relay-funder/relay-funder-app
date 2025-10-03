import { db } from '@/server/db';
import { checkAuth, checkContractAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiIntegrityError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { createTreasuryManager } from '@/lib/treasury/interface';
import { ethers } from 'ethers';
import { chainConfig } from '@/lib/web3';
import { debugWeb3 as debug } from '@/lib/debug';

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
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

    if (campaign.treasuryAddress) {
      throw new ApiIntegrityError(
        'Treasury already deployed for this campaign',
      );
    }

    // Deploy treasury using TreasuryManager (server-side with platform admin key)

    const treasuryManager = await createTreasuryManager();
    const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;

    if (!platformAdminKey) {
      throw new Error('PLATFORM_ADMIN_PRIVATE_KEY not configured');
    }

    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    const platformAdminSigner = new ethers.Wallet(platformAdminKey, provider);

    const deployResult = await treasuryManager.deploy({
      campaignId,
      platformBytes: process.env.NEXT_PUBLIC_PLATFORM_HASH!,
      campaignAddress: campaign.campaignAddress,
      signer: platformAdminSigner,
    });

    if (deployResult.deploymentStatus !== 'success') {
      throw new Error(`Treasury deployment failed: ${deployResult.error}`);
    }

    debug && console.log(`Treasury deployed at: ${deployResult.address}`);
    debug && console.log(`Transaction hash: ${deployResult.transactionHash}`);

    // Configure treasury immediately after deployment
    debug && console.log('Configuring treasury with campaign parameters...');
    const configResult = await treasuryManager.configureTreasury(
      deployResult.address,
      campaignId,
      platformAdminSigner,
    );

    if (!configResult.success) {
      // Treasury is deployed but not configured - this is a critical error
      throw new ApiIntegrityError(
        `Treasury deployed but configuration failed: ${configResult.error}. Please reconfigure via admin panel.`,
      );
    }

    debug && console.log(
      `Treasury configured successfully: ${configResult.transactionHash}`,
    );

    return response({
      treasuryAddress: deployResult.address,
      deploymentTransactionHash: deployResult.transactionHash,
      configurationTransactionHash: configResult.transactionHash,
      status: 'success',
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
