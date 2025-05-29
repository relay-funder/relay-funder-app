import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { transition } from './sidebar-constants';

export function PageNavMenuSettings() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3">
      <Link
        href="/settings"
        className={cn(
          'flex items-center rounded-lg px-1 py-4 text-gray-800 hover:bg-gray-100 hover:text-gray-900',
          transition,
          isOpen ? 'px-4' : 'px-[9px]',
          pathname === '/settings' && 'flex-grow bg-green-200 text-gray-900',
        )}
      >
        <div className="flex items-center">
          <Settings className="h-6 w-6" />
        </div>
        <span
          className={cn(
            'ml-3 overflow-hidden',
            transition,
            isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
          )}
        >
          Settings
        </span>
      </Link>
    </nav>
  );
}
