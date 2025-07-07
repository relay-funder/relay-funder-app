import Image from 'next/image';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts';
import { useAuth } from '@/contexts';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { transition } from './sidebar-constants';
import { useSession } from 'next-auth/react';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
export function PageNavMenuUser() {
  const { isOpen } = useSidebar();
  const session = useSession();
  const { login, logout, authenticated, address } = useAuth();
  const name = useMemo(() => {
    if (
      typeof session?.data?.user?.email === 'string' &&
      session?.data?.user?.email.length
    ) {
      return session.data.user.email;
    }
    if (typeof address === 'string') {
      return shortenAddress(address);
    }
    return 'User';
  }, [address, session]);
  return (
    <nav className="flex-1 space-y-1 px-3">
      <div
        className={cn(
          'flex items-center rounded-lg px-1 py-4 text-gray-800 hover:bg-gray-100 hover:text-gray-900',
          transition,
          isOpen ? 'px-4' : 'px-[9px]',
        )}
      >
        <div className="flex items-center">
          <div className={cn('relative h-[24px] overflow-hidden', 'w-[24px]')}>
            <div
              className={cn(
                'absolute left-0 top-0',
                transition,
                'w-[24px] opacity-100',
              )}
            >
              <Image
                src="https://avatar.vercel.sh/user"
                alt="User"
                width={24}
                height={24}
                className={cn('rounded-full')}
              />
            </div>
          </div>
        </div>
        <span
          className={cn(
            'ml-0 overflow-hidden',
            'transition-all duration-300 ease-in-out',
            isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
          )}
        >
          {!authenticated ? (
            <Button
              variant="ghost"
              className="pl-3 text-sm font-semibold text-black"
              onClick={login}
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-2">
              {name}
              <span title="Logout">
                <LogOut
                  className="h-5 w-5 cursor-pointer text-gray-400 transition-colors group-hover:text-red-600"
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                />
              </span>
            </div>
          )}
        </span>
      </div>
    </nav>
  );
}
