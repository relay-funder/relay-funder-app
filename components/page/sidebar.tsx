'use client';

import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts';
import { PageNavMenuIcon } from './nav-menu-icon';
import { PageNavMenuItems } from './nav-menu-items';
import { PageNavMenuSettings } from './nav-menu-settings';
import { PageNavMenuUser } from './nav-menu-user';
import { MobileMenuHeader } from './mobile-menu-header';
import { transition } from './sidebar-constants';
export const PageSidebar = () => {
  const { isOpen, show, hide, move, toggle } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggle}
        />
      )}

      <div className={cn(isOpen ? 'h-screen' : 'h-[100px] md:h-screen')}>
        <aside
          className={cn(
            'fixed left-0 top-0 border-r bg-background',
            'overflow-hidden',
            transition,
            // Mobile: full overlay when open, hidden when closed
            // Desktop: normal sidebar behavior
            'md:z-40',
            isOpen
              ? 'z-40 h-full w-[240px]'
              : 'z-40 h-[100px] w-[70px] md:h-full',
            // Mobile: slide in from left when closed
            !isOpen &&
              '-translate-x-full md:h-full md:w-[70px] md:translate-x-0',
          )}
          onMouseEnter={show}
          onMouseLeave={hide}
          onMouseMove={move}
        >
          <div className={cn('flex flex-col', 'h-screen')}>
            {/* Desktop: Show nav menu icon, Mobile: Show mobile menu header */}
            <PageNavMenuIcon />
            <MobileMenuHeader />
            <div
              className={cn(
                'flex flex-1 flex-col overflow-y-auto overflow-x-clip',
              )}
            >
              <div className="grow">
                <PageNavMenuItems />
              </div>
              <div className="grow-0 border-t">
                <PageNavMenuSettings />
              </div>

              <div className="grow-0">
                <PageNavMenuUser />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};
