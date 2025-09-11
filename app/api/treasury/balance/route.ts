import { createTreasuryManager } from '@/lib/treasury/interface';
import { response, handleError } from '@/lib/api/response';
import { ApiParameterError } from '@/lib/api/error';
import { ethers } from 'ethers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const treasuryAddress = searchParams.get('address');

    if (!treasuryAddress) {
      throw new ApiParameterError('Treasury address is required');
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(treasuryAddress)) {
      throw new ApiParameterError('Invalid treasury address format');
    }

    const treasuryManager = await createTreasuryManager();
    const balance = await treasuryManager.getBalance(treasuryAddress);

    return response({ balance });
  } catch (error: unknown) {
    console.error('Error fetching treasury balance:', error);
    return handleError(error);
  }
}
