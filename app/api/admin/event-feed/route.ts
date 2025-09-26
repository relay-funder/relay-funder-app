import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { listAdminEventFeed } from '@/lib/api/user';
import { GetEventFeedRequestSchema } from '@/lib/api/types/event-feed';

export async function GET(req: Request) {
  try {
    await checkAuth(['admin']);

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
      await listAdminEventFeed({
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
