import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { listUsers } from '@/lib/api/user';

export async function GET(req: Request) {
  try {
    checkAuth(['admin']);
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') ?? undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    if (pageSize > 10) {
      throw new ApiParameterError('Maximum Page size exceeded');
    }
    // status active should be enforced if access-token is not admin
    return response(
      await listUsers({
        name,
        page,
        pageSize,
        skip,
      }),
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
