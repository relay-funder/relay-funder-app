import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiIntegrityError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { notifyIntern } from '@/lib/api/event-feed';
import { isProfileComplete } from '@/lib/api/user';

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const { lastName, firstName, username, bio, recipientWallet, email } =
      await req.json();

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await db.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.address !== session.user.address) {
        throw new ApiIntegrityError('Username is already taken');
      }
    }

    // Get current user to check if profile was incomplete
    const currentUser = await db.user.findUnique({
      where: { address: session.user.address },
    });

    const wasIncomplete = !isProfileComplete(currentUser);

    // Find or create the user
    const user = await db.user.update({
      where: { address: session.user.address },
      data: {
        firstName,
        lastName,
        username,
        ...(recipientWallet && { recipientWallet }),
        ...(email && { email }),
        bio,
      },
    });

    // Notify admin if profile was just completed
    const isComplete = isProfileComplete(user);
    if (wasIncomplete && isComplete) {
      notifyIntern({
        creatorId: user.id,
        data: {
          type: 'ProfileCompleted',
          userName: `${user.firstName} ${user.lastName}`,
        },
      });
    }

    return response({
      success: true,
      user,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
