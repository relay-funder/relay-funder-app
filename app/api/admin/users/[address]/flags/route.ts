import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { GetUserResponse, UserWithAddressParams } from '@/lib/api/types/admin';
import { getUser, updateUserFlags } from '@/lib/api/user';
import { USER_FLAGS } from '@/lib/constant/user-flags';

export async function PATCH(req: Request, { params }: UserWithAddressParams) {
  try {
    await checkAuth(['admin']);
    const { address } = await params;
    const { flags } = await req.json();

    const instance = await getUser(address);
    if (!instance) {
      throw new ApiNotFoundError('User not found');
    }
    if (!instance.featureFlags.includes('USER_MODERATOR')) {
      throw new ApiAuthNotAllowed('Admin needs USER_MODERATOR flag');
    }
    if (!Array.isArray(flags)) {
      throw new ApiParameterError('Flags needs to be an array');
    }
    for (const flag of flags) {
      if (typeof flag !== 'string' || flag.trim().length === 0) {
        throw new ApiParameterError('Flag must be a nonempty string');
      }
      if (!USER_FLAGS.includes(flag)) {
        throw new ApiParameterError(`Flag ${flag} is not a valid user flag`);
      }
    }
    await updateUserFlags(address, flags);

    return response({
      user: instance,
    } as GetUserResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
