import { createTreasuryManager } from '@/lib/treasury/interface';
import { response, handleError } from '@/lib/api/response';
import { ApiParameterError } from '@/lib/api/error';
import { ethers } from 'ethers';
import { USD_TOKEN } from '@/lib/constant';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const treasuryAddress = searchParams.get('address');

    if (!treasuryAddress) {
      throw new ApiParameterError('Treasury address is required');
    }
    const { isDummy } = await require('@/lib/web3');
    if (isDummy) {
      return response({
        balance: {
          available: '100',
          totalPledged: '200',
          currency: USD_TOKEN,
        },
      });
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
