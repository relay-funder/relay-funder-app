'use client';

import { cn } from '@/lib/utils';
import { PageSidebar } from '@/components/page/sidebar';
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
          isOpen ? 'md:ml-[240px]' : 'md:ml-[72px]',
        )}
      >
        <div>
          <div
            className={cn(
              'float-left h-[100px] w-[72px] md:float-none md:hidden',
              'bg-white',
            )}
          >
            {/* placeholder to avoid that sidebar covers content */}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
