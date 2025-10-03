'use client';

import { cn } from '@/lib/utils';
import { PageSidebar } from '@/components/page/sidebar';
import { MobileTopBar } from '@/components/page/mobile-top-bar';
import { PageFooter } from '@/components/page/footer';
import { useSidebar } from '@/contexts';

export function PageMainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  if (typeof isOpen === 'undefined') {
    return null; // or a loading state
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <PageSidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-in-out',
          // Desktop: margin based on sidebar state
          // Mobile: no margin, content flows naturally
          'md:ml-0',
          isOpen ? 'md:ml-[240px]' : 'md:ml-[72px]',
        )}
      >
        {/* Global Mobile Top Bar - shows on all pages */}
        <MobileTopBar />

        {/* Main content area */}
        <div className="flex-1">
          {/* Mobile: Content flows under the mobile top bar */}
          {/* Desktop: Keep existing behavior */}
          <div className="md:hidden">
            {/* Mobile content flows normally under the mobile top bar */}
          </div>
          <div className="hidden md:block">
            <div
              className={cn(
                'float-left h-[100px] w-[72px] md:float-none md:hidden',
                'bg-background',
              )}
            >
              {/* placeholder to avoid that sidebar covers content */}
            </div>
          </div>
          {children}
        </div>

        {/* Global Footer - always at the bottom */}
        <PageFooter />
      </div>
    </div>
  );
}
