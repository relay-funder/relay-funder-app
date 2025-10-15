import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import type {
  GetUserResponse,
  UserWithAddressParams,
} from '@/lib/api/types/admin';
import { getUser, updateUserRoles } from '@/lib/api/user';

export async function PATCH(req: Request, { params }: UserWithAddressParams) {
  try {
    await checkAuth(['admin']);
    const { address } = await params;
    const { roles } = await req.json();

    const instance = await getUser(address);
    if (!instance) {
      throw new ApiNotFoundError('User not found');
    }
    if (!instance.featureFlags.includes('USER_MODERATOR')) {
      throw new ApiAuthNotAllowed('Admin needs USER_MODERATOR flag');
    }

    if (!Array.isArray(roles)) {
      throw new ApiParameterError('Roles needs to be an array');
    }
    for (const role of roles) {
      if (typeof role !== 'string' || role.trim().length === 0) {
        throw new ApiParameterError('Role must be a nonempty string');
      }
    }

    await updateUserRoles(address, roles);
    const updatedInstance = await getUser(address);

    return response({
      user: updatedInstance!,
    } as GetUserResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
