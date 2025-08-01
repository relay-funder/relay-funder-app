import { UserAvatar } from './avatar';
import { FALLBACK_USER_NAME } from './constants';
export function UserInlineName({
  user,
}: {
  user?: { name?: string | null; address?: string | null };
}) {
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap pr-1">
      <UserAvatar user={user} />
      <span className="text-sm font-semibold text-pink-500">
        {user?.name ?? FALLBACK_USER_NAME}
      </span>
    </span>
  );
}
