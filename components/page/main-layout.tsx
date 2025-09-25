'use client';

import { cn } from '@/lib/utils';
import { PageSidebar } from '@/components/page/sidebar';
import { MobileTopBar } from '@/components/page/mobile-top-bar';
import { useSidebar } from '@/contexts';

export function PageMainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  if (typeof isOpen === 'undefined') {
    return null; // or a loading state
  }

  return (
    <div className="flex overflow-x-hidden bg-gray-50">
      <PageSidebar />
      <div
        className={cn(
          'min-h-screen flex-1 transition-all duration-300 ease-in-out',
          // Desktop: margin based on sidebar state
          // Mobile: no margin, content flows naturally
          'md:ml-0',
          isOpen ? 'md:ml-[240px]' : 'md:ml-[72px]',
        )}
      >
        {/* Global Mobile Top Bar - shows on all pages */}
        <MobileTopBar />

        <div>
          {/* Mobile: Content flows under the mobile top bar */}
          {/* Desktop: Keep existing behavior */}
          <div className="md:hidden">
            {/* Mobile content flows normally under the mobile top bar */}
          </div>
          <div className="hidden md:block">
            <div
              className={cn(
                'float-left h-[100px] w-[72px] md:float-none md:hidden',
                'bg-white',
              )}
            >
              {/* placeholder to avoid that sidebar covers content */}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
