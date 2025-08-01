import { Badge } from '@/components/ui';
import { UserAvatar } from './avatar';

export function UserInlineBadges({
  user,
}: {
  user?: {
    name?: string | null;
    address?: string | null;
    isKycCompleted: boolean;
    isVouched?: boolean;
  };
}) {
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap pr-1">
      <UserAvatar user={user} />
      <span className="flex gap-2">
        {user?.isKycCompleted && (
          <Badge className="bg-indigo-600">Verified</Badge>
        )}
        {user?.isVouched && <Badge className="bg-indigo-600">Vouched</Badge>}
      </span>
    </span>
  );
}
