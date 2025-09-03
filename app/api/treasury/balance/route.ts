import { createTreasuryManager } from '@/lib/treasury/interface';
import { response, handleError } from '@/lib/api/response';
import { ApiParameterError } from '@/lib/api/error';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const treasuryAddress = searchParams.get('address');

    if (!treasuryAddress) {
      throw new ApiParameterError('Treasury address is required');
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(treasuryAddress)) {
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
