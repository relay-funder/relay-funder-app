import { checkAuth, isAdmin } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { getStats } from '@/lib/api/campaigns';

export async function GET() {
  try {
    const session = await checkAuth(['user']);
    const admin = await isAdmin();
    return response(
      await getStats({
        creatorAddress: session.user.address,
        admin,
      }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
