import { Badge } from '@/components/ui';

export function UserInlineBadges({
  user,
}: {
  user?: {
    isKycCompleted?: boolean;
    isVouched?: boolean;
  };
}) {
  return (
    <span className="flex gap-2">
      {user?.isKycCompleted && (
        <Badge className="bg-indigo-600">Verified</Badge>
      )}
      {user?.isVouched && <Badge className="bg-indigo-600">Vouched</Badge>}
    </span>
  );
}
