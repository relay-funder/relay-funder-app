import Link from 'next/link';
import { useMemo, type JSX } from 'react';
import { useSidebar, useAuth } from '@/contexts';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Target,
  Shield,
  Users,
  CreditCard,
  Coins,
} from 'lucide-react';
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

    // Show Dashboard and Campaigns for all authenticated users (both regular users and admins)
    if (authenticated) {
      items.push({
        icon: <LayoutDashboard className="h-6 w-6" />,
        label: 'Dashboard',
        href: '/dashboard',
      });
      items.push({
        icon: <Target className="h-6 w-6" />,
        label: 'Campaigns',
        href: '/campaigns',
      });
    }

    // Show Funding Rounds for non-admin users
    if (authenticated && !isAdmin) {
      items.push({
        icon: <Coins className="h-6 w-6" />,
        label: 'Funding Rounds',
        href: '/rounds',
      });
    }

    // Show admin-specific items for admin users
    if (authenticated && isAdmin) {
      items.push({
        icon: <Shield className="h-6 w-6" />,
        label: 'Control Center',
        href: '/admin',
      });
      items.push({
        icon: <Target className="h-6 w-6" />,
        label: 'Round Management',
        href: '/admin/rounds',
      });
      items.push({
        icon: <Users className="h-6 w-6" />,
        label: 'User Management',
        href: '/admin/users',
      });
      items.push({
        icon: <CreditCard className="h-6 w-6" />,
        label: 'Payments',
        href: '/admin/payments',
      });
      items.push({
        icon: <Coins className="h-6 w-6" />,
        label: 'Withdrawals',
        href: '/admin/withdrawals',
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
              'ml-3 overflow-hidden whitespace-nowrap',
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
