import { checkAuth, isAdmin } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { getStats } from '@/lib/api/campaigns';

export async function GET(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'user' or 'global'

    // Default behavior: admin users get global stats, regular users get user-scoped stats
    // But if scope=user is explicitly requested, always return user-scoped stats
    const admin = scope === 'user' ? false : await isAdmin();

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
