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

  // Separate user and admin items for visual grouping
  const userItems = useMemo(() => {
    const baseItems = [
      { icon: <Home className="h-6 w-6" />, label: 'Home', href: '/' },
    ];

    // Show Dashboard and Campaigns for all authenticated users
    if (authenticated) {
      baseItems.push(
        {
          icon: <LayoutDashboard className="h-6 w-6" />,
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          icon: <Target className="h-6 w-6" />,
          label: 'Campaigns',
          href: '/campaigns',
        },
      );
    }

    // Add Funding Rounds for non-admin users
    if (authenticated && !isAdmin) {
      baseItems.push({
        icon: <Coins className="h-6 w-6" />,
        label: 'Funding Rounds',
        href: '/rounds',
      });
    }

    return baseItems;
  }, [authenticated, isAdmin]);

  const adminItems = useMemo(() => {
    if (!authenticated || !isAdmin) return [];

    return [
      {
        icon: <Shield className="h-6 w-6" />,
        label: 'Campaigns',
        href: '/admin',
      },
      {
        icon: <Target className="h-6 w-6" />,
        label: 'Rounds',
        href: '/admin/rounds',
      },
      {
        icon: <Users className="h-6 w-6" />,
        label: 'Users',
        href: '/admin/users',
      },
      {
        icon: <CreditCard className="h-6 w-6" />,
        label: 'Payments',
        href: '/admin/payments',
      },
      {
        icon: <Coins className="h-6 w-6" />,
        label: 'Withdrawals',
        href: '/admin/withdrawals',
      },
    ];
  }, [authenticated, isAdmin]);

  const renderNavItem = (item: NavItem) => (
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
  );

  return (
    <nav className="flex-1 space-y-1 p-3">
      {/* User Items */}
      {userItems.map(renderNavItem)}

      {/* Separator between user and admin items */}
      {authenticated && isAdmin && adminItems.length > 0 && (
        <div
          className="mx-2 border-t border-gray-200"
          style={{ marginTop: 20, marginBottom: 20 }}
        />
      )}

      {/* Admin Items */}
      {adminItems.map(renderNavItem)}
    </nav>
  );
}
