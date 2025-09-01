import { useMemo } from 'react';
import { UserAvatar } from './avatar';
import { FALLBACK_USER_NAME } from './constants';
import { UserInlineBadges } from './inline-badges';

export function UserInlineName({
  user,
  badges = false,
  prefix,
}: {
  user?: {
    name?: string | null;
    address?: string | null;
    isKycCompleted?: boolean;
    isVouched?: boolean;
  };
  badges?: boolean;
  prefix?: React.ReactNode;
}) {
  const name = useMemo(() => {
    let name = '';
    if (typeof user?.name === 'string' && user.name.trim().length) {
      name = user.name;
    } else if (
      typeof user?.address === 'string' &&
      user.address.trim().length
    ) {
      name = user.address;
    } else {
      name = FALLBACK_USER_NAME;
    }
    return name;
  }, [user?.name, user?.address]);
  const shortName = useMemo(() => {
    if (name.length > 13) {
      return `${name.slice(0, 6)}...${name.slice(-4)}`;
    }
    return name;
  }, [name]);
  return (
    <span className="pr inline-flex items-center gap-2 whitespace-nowrap align-text-bottom">
      {typeof prefix !== 'undefined' && (
        <span className="text-sm font-semibold">{prefix}</span>
      )}
      <UserAvatar user={user} />
      <span title={name} className="text-sm font-semibold text-pink-500">
        {shortName}
      </span>
      {badges && <UserInlineBadges user={user} />}
    </span>
  );
}
