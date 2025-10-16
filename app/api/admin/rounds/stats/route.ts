import { checkAuth } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { getStats } from '@/lib/api/rounds';

export async function GET() {
  try {
    await checkAuth(['admin']);
    return response(await getStats());
  } catch (error: unknown) {
    return handleError(error);
  }
}
