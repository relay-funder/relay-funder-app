import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { calculateUserScore } from '@/lib/api/user';

export async function GET() {
  try {
    const session = await checkAuth(['user']);

    const user = await db.user.findUnique({
      where: { address: session.user.address },
    });

    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    const score = await calculateUserScore({ userId: user.id });

    return response(score);
  } catch (error: unknown) {
    return handleError(error);
  }
}
