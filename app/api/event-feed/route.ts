import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  getUser,
  listUserEventFeed,
  updateEventFeedRead,
} from '@/lib/api/user';
import { GetEventFeedRequestSchema } from '@/lib/api/types/event-feed';

export async function GET(req: Request) {
  try {
    const session = await checkAuth(['user']);

    const user = await db.user.findUnique({
      where: { address: session.user.address },
    });

    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    const { searchParams } = new URL(req.url);

    const { page, pageSize, type, startDate, endDate } =
      GetEventFeedRequestSchema.parse({
        page: searchParams.get('page') || '1',
        pageSize: searchParams.get('pageSize') || '10',
        type: searchParams.get('type') ?? undefined,
        startDate: searchParams.get('startDate') ?? undefined,
        endDate: searchParams.get('endDate') ?? undefined,
      });
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }
    return response(
      await listUserEventFeed({
        user,
        type,
        startDate,
        endDate,
        page,
        pageSize,
      }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
export async function POST() {
  try {
    const session = await checkAuth(['user']);
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('Admin user not found');
    }
    updateEventFeedRead(user.address);
    return response({
      success: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
