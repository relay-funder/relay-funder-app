import { checkAuth, isAdmin } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { listRounds } from '@/lib/api/rounds';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    const forceUserView = searchParams.get('forceUserView') === 'true';
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }

    // Check if user is admin to determine campaign filtering
    // If forceUserView is true, always use user-only mode regardless of admin status
    const admin = forceUserView ? false : await isAdmin();

    // Get current user's address for including their own campaigns
    let userAddress: string | null = null;
    try {
      const session = await checkAuth(['user']);
      userAddress = session.user.address;
    } catch {
      // User not authenticated, continue without user address
    }

    return response(
      await listRounds({ page, pageSize, skip, admin, userAddress }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
