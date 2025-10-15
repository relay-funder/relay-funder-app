import { Badge } from '@/components/ui';

export function UserInlineBadges({
  user,
}: {
  user?: {
    isVouched?: boolean;
  };
}) {
  return (
    <span className="flex gap-2">
      {user?.isVouched && <Badge className="bg-indigo-600">Vouched</Badge>}
    </span>
  );
}
