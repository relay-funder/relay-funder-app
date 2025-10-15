import { ethers } from 'ethers';
import { response, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL as string;
    const globalParams = process.env.NEXT_PUBLIC_GLOBAL_PARAMS as `0x${string}`;
    const platformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH as `0x${string}`;

    if (!rpcUrl || !globalParams || !platformHash) {
      console.warn('[platform/status] Missing env', {
        hasRpcUrl: !!rpcUrl,
        hasGlobalParams: !!globalParams,
        hasPlatformHash: !!platformHash,
      });
      return response({ success: false, error: 'Missing required env vars' });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    // Enhanced ABI to include platform admin debugging
    const gp = new ethers.Contract(
      globalParams,
      [
        'function checkIfPlatformIsListed(bytes32) view returns (bool)',
        'function checkIfPlatformDataKeyValid(bytes32) view returns (bool)',
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

    const keyNames = [
      'flatFee',
      'cumulativeFlatFee',
      'platformFee',
      'vakiCommission',
    ] as const;
    const keys = await Promise.all(
      keyNames.map(async (name) => {
        try {
          const keyHash = ethers.keccak256(ethers.toUtf8Bytes(name));
          const isValid = await gp.checkIfPlatformDataKeyValid(keyHash);
          return { name, keyHash, isValid };
        } catch (keyError) {
          return {
            name,
            error:
              keyError instanceof Error ? keyError.message : 'Unknown error',
          };
        }
      }),
    );

    return response({
      success: true,
      isListed,
      platformAdminAddress,
      keys,
    });
  } catch (error: unknown) {
    console.error('[platform/status] Error', error);
    return handleError(error);
  }
}
