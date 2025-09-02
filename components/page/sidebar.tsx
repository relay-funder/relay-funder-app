'use client';

import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts';
import { PageNavMenuIcon } from './nav-menu-icon';
import { PageNavMenuItems } from './nav-menu-items';
import { PageNavMenuSettings } from './nav-menu-settings';
import { PageNavMenuFeatures } from './nav-menu-features';
import { PageNavMenuUser } from './nav-menu-user';
import { transition } from './sidebar-constants';
export const PageSidebar = () => {
  const { isOpen, show, hide, move } = useSidebar();

  return (
    <div className={cn(isOpen ? 'h-screen' : 'h-[100px] md:h-screen')}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 border-r bg-white',
          'overflow-hidden',
          transition,
          isOpen ? 'h-full w-[240px]' : 'h-[100px] w-[70px] md:h-full',
        )}
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseMove={move}
      >
        <div className={cn('flex flex-col', 'h-screen')}>
          <PageNavMenuIcon />
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
  );
};
