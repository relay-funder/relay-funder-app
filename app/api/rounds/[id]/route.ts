import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';
import { isAdmin } from '@/lib/api/auth';
import { getRound } from '@/lib/api/rounds';
import { auth } from '@/server/auth';

export async function GET(req: Request, { params }: RoundsWithIdParams) {
  try {
    // public endpoint
    // when signed in, session & admin declare how much relation data is fetched
    // default is only approved
    // as admin, get any state
    // as user only get any-state when campaign is created by user
    const { searchParams } = new URL(req.url);
    const forceUserView = searchParams.get('forceUserView') === 'true';

    const session = await auth();
    // If forceUserView is true, always use user-only mode regardless of admin status
    const admin = forceUserView ? false : await isAdmin();

    const id = (await params).id;
    const round = await getRound(parseInt(id), admin, session?.user.address);

    return response({ round });
  } catch (error: unknown) {
    return handleError(error);
  }
}
