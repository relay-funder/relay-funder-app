'use client';

import { useAuth } from '@/contexts';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import Image from 'next/image';

export function MobileAuthBadge() {
  const { authenticated, login } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (authenticated) {
      router.push('/profile');
    } else {
      login();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'relative z-20 md:hidden',
        'h-8 px-3 text-xs font-semibold',
        authenticated
          ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' // Match desktop exactly
          : 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      )}
      onClick={handleClick}
    >
      {authenticated ? 'Connected' : 'Connect'}
      <Image src="/wallet-icon.png" alt="wallet" width={14} height={14} />
    </Button>
  );
}
