import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { FALLBACK_USER_NAME, FALLBACK_USER_INITIALS } from './constants';

export function UserAvatar({
  user,
}: {
  user?: { name?: string | null; address?: string | null };
}) {
  const name = useMemo(() => {
    if (typeof user?.name === 'string' && user.name.trim().length) {
      return user.name;
    }
    if (typeof user?.address === 'string' && user.address.trim().length) {
      return user.address;
    }
    return FALLBACK_USER_NAME;
  }, [user?.name, user?.address]);
  const initials = useMemo(() => {
    if (name === FALLBACK_USER_NAME) {
      return FALLBACK_USER_INITIALS;
    }
    const nameWithoutHex = name.replace(/^0x/, '');
    const nameparts = nameWithoutHex.split(/\b/);
    if (nameparts.length > 1) {
      return nameparts[0][0] + nameparts[1][0];
    }
    if (nameWithoutHex.length > 1) {
      return nameWithoutHex[0] + nameWithoutHex[1];
    }
    return nameWithoutHex[0] + nameWithoutHex[0];
  }, [name]);
  return (
    <Avatar title={name} className="h-[24px] w-[24px]">
      <AvatarImage
        src={`https://avatar.vercel.sh/${name}`}
        width={24}
        height={24}
      />
      <AvatarFallback>{initials.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
