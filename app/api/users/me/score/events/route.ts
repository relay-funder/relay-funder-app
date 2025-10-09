import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getUser, getUserScoreEvents } from '@/lib/api/user';
import { GetScoreEventsRequestSchema } from '@/lib/api/types';

export async function GET(req: Request) {
  try {
    const session = await checkAuth(['user']);

    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    const { searchParams } = new URL(req.url);

    const { page, pageSize, category } = GetScoreEventsRequestSchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      category: searchParams.get('category') ?? undefined,
    });

    if (pageSize > 100) {
      throw new ApiParameterError('Maximum page size exceeded');
    }

    const result = await getUserScoreEvents({
      userId: user.id,
      page,
      pageSize,
      category,
    });

    return response(result);
  } catch (error: unknown) {
    return handleError(error);
  }
}
