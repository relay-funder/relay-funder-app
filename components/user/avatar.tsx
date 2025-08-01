import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { FALLBACK_USER_NAME, FALLBACK_USER_INITIALS } from './constants';

export function UserAvatar({
  user,
}: {
  user?: { name?: string | null; address?: string | null };
}) {
  const name = user?.name ?? user?.address ?? FALLBACK_USER_NAME;
  const initials = user?.name ?? user?.address ?? FALLBACK_USER_INITIALS;
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
