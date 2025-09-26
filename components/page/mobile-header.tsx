'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MobileTopBar } from './mobile-top-bar';

export function MobileHeader({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('md:hidden', className)}>
      {/* Non-sticky top bar with logo, auth indicator, and hamburger */}
      <MobileTopBar />

      {/* Header content below top bar */}
      <div className="space-y-4 px-4 py-4">{children}</div>
    </div>
  );
}
