import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth, useSidebar } from '@/contexts';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { transition } from './sidebar-constants';

export function PageNavMenuSettings() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const { authenticated } = useAuth();
  if (!authenticated) {
    return null;
  }
  return (
    <nav className="flex-1 space-y-1 p-3">
      <Link
        href="/profile"
        className={cn(
          'flex items-center rounded-lg px-1 py-4 text-foreground hover:bg-accent hover:text-accent-foreground',
          transition,
          isOpen ? 'px-4' : 'px-[9px]',
          pathname === '/profile' &&
            'flex-grow bg-secondary text-secondary-foreground',
        )}
      >
        <div className="flex items-center">
          <User className="h-6 w-6" />
        </div>
        <span
          className={cn(
            'ml-3 overflow-hidden',
            transition,
            isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
          )}
        >
          Profile
        </span>
      </Link>
    </nav>
  );
}
