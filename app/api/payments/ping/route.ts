import { checkAuth } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';

export async function POST() {
  try {
    console.log('🏓 Payment ping endpoint called');
    const session = await checkAuth(['user']);
    console.log('✅ Auth successful for user:', session.user.address);

    return response({
      success: true,
      userAddress: session.user.address,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('🚨 Payment ping failed:', error);
    return handleError(error);
  }
}
