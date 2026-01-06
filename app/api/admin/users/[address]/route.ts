import { checkAuth } from '@/lib/api/auth';
import { ApiAuthNotAllowed, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  GetUserResponse,
  PatchUserRouteBodySchema,
  UserWithAddressParams,
} from '@/lib/api/types/admin';
import {
  getUser,
  updateUserBio,
  updateUserEmail,
  updateUserNames,
  updateUserRecipientWallet,
} from '@/lib/api/user';

export async function GET(req: Request, { params }: UserWithAddressParams) {
  try {
    await checkAuth(['admin']);
    const { address } = await params;
    const instance = await getUser(address);
    if (!instance) {
      throw new ApiNotFoundError('User not found');
    }

    return response({
      user: instance,
    } as GetUserResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: UserWithAddressParams) {
  try {
    const session = await checkAuth(['admin']);
    const { address } = await params;
    const { email, username, firstName, lastName, bio, recipientWallet } =
      PatchUserRouteBodySchema.parse(await req.json());

    const instance = await getUser(address);
    if (!instance) {
      throw new ApiNotFoundError('User not found');
    }
    const admin = await getUser(session.user.address);
    if (!admin) {
      throw new ApiNotFoundError('Admin User not found');
    }
    if (!admin.featureFlags.includes('USER_MODERATOR')) {
      throw new ApiAuthNotAllowed('Admin needs USER_MODERATOR flag');
    }
    if (email) {
      await updateUserEmail(address, email);
    }
    if (
      typeof username !== 'undefined' ||
      typeof firstName !== 'undefined' ||
      typeof lastName !== 'undefined'
    ) {
      await updateUserNames(address, username, firstName, lastName);
    }
    if (typeof bio !== 'undefined') {
      await updateUserBio(address, bio);
    }
    if (typeof recipientWallet !== 'undefined') {
      await updateUserRecipientWallet(address, recipientWallet);
    }

    const updatedInstance = await getUser(address);
    return response({
      user: updatedInstance,
    } as GetUserResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
