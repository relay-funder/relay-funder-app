import { ethers } from 'ethers';
import { response, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL as string;
    const globalParams = process.env.NEXT_PUBLIC_GLOBAL_PARAMS as `0x${string}`;
    const treasuryFactory = process.env
      .NEXT_PUBLIC_TREASURY_FACTORY as `0x${string}`;
    const campaignInfoFactory = process.env
      .NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY as `0x${string}`;
    const platformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH as `0x${string}`;

    if (
      !rpcUrl ||
      !globalParams ||
      !treasuryFactory ||
      !campaignInfoFactory ||
      !platformHash
    ) {
      console.warn('[platform/status] Missing env', {
        hasRpcUrl: !!rpcUrl,
        hasGlobalParams: !!globalParams,
        hasTreasuryFactory: !!treasuryFactory,
        hasCampaignInfoFactory: !!campaignInfoFactory,
        hasPlatformHash: !!platformHash,
      });
      return response({ success: false, error: 'Missing required env vars' });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Check GlobalParams for platform listing and admin
    const gp = new ethers.Contract(
      globalParams,
      [
        'function checkIfPlatformIsListed(bytes32) view returns (bool)',
        'function getPlatformAdminAddress(bytes32) view returns (address account)',
      ],
      provider,
    );

    const isListed: boolean = await gp.checkIfPlatformIsListed(platformHash);

    // Get platform admin address
    let platformAdminAddress = null;
    try {
      const adminResult = await gp.getPlatformAdminAddress(platformHash);
      platformAdminAddress = adminResult.account || adminResult; // Handle both struct and direct return
    } catch (adminError) {
      console.error('Failed to get platform admin:', adminError);
    }

    // Check TreasuryFactory for implementation registration/approval
    const tf = new ethers.Contract(
      treasuryFactory,
      [
        'function getTreasuryImplementation(bytes32,uint256) view returns (address)',
        'function isTreasuryImplementationApproved(bytes32,uint256) view returns (bool)',
      ],
      provider,
    );

    // Check KeepWhatsRaised implementation (ID: 1) for production
    const implementationId = 1;
    let treasuryImplementation = null;
    let isImplementationApproved = false;

    try {
      treasuryImplementation = await tf.getTreasuryImplementation(
        platformHash,
        implementationId,
      );
      isImplementationApproved = await tf.isTreasuryImplementationApproved(
        platformHash,
        implementationId,
      );
    } catch (treasuryError) {
      console.error('Failed to check treasury implementation:', treasuryError);
    }

    return response({
      success: true,
      isListed,
      platformAdminAddress,
      treasuryImplementation: {
        address: treasuryImplementation,
        implementationId,
        isApproved: isImplementationApproved,
      },
      contractAddresses: {
        globalParams,
        treasuryFactory,
        campaignInfoFactory,
        platformHash,
      },
    });
  } catch (error: unknown) {
    console.error('[platform/status] Error', error);
    return handleError(error);
  }
}
