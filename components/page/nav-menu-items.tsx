import Link from 'next/link';
import { useMemo, type JSX } from 'react';
import { useSidebar, useFeatureFlag, useAuth } from '@/contexts';
import { usePathname } from 'next/navigation';
import { Grid, Home, Star, BookCheck } from 'lucide-react';
import { transition } from './sidebar-constants';
import { cn } from '@/lib/utils';
interface NavItem {
  icon: JSX.Element;
  label: string;
  href: string;
}

export function PageNavMenuItems() {
  const { isOpen } = useSidebar();
  const { authenticated, isAdmin } = useAuth();

  const pathname = usePathname();
  const navItems = useMemo<NavItem[]>(() => {
    const items = [
      { icon: <Home className="h-6 w-6" />, label: 'Home', href: '/' },
    ];
    if (!isAdmin) {
      items.push({
        icon: <Grid className="h-6 w-6" />,
        label: 'Dashboard',
        href: '/dashboard',
      });
      items.push({
        icon: <Star className="h-6 w-6" />,
        label: 'Collections',
        href: '/collections',
      });
    }
    if (authenticated && isAdmin) {
      items.push({
        icon: <Grid className="h-6 w-6" />,
        label: 'Admin Dashboard',
        href: '/admin',
      });
      items.push({
        icon: <BookCheck className="h-6 w-6" />,
        label: 'Admin Rounds',
        href: '/admin/rounds',
      });
    }
    return items;
  }, [authenticated, isAdmin]);

  return (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center rounded-lg px-1 py-4 text-gray-800 hover:bg-gray-100 hover:text-gray-900',
            transition,
            isOpen ? 'px-4' : 'px-[9px]',
            pathname === item.href && 'flex-grow bg-green-200 text-gray-900',
          )}
        >
          <div className="flex items-center">{item.icon}</div>
          <span
            className={cn(
              'ml-3 overflow-hidden',
              transition,
              isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
            )}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
