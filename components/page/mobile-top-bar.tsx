'use client';

import { cn } from '@/lib/utils';
import { MobileLogo } from './mobile-logo';
import { MobileAuthBadge } from './mobile-auth-indicator';
import { MobileHamburgerButton } from './mobile-hamburger-button';

export function MobileTopBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative h-16 w-full border-b border-gray-200 bg-white md:hidden',
        'flex items-center justify-between px-4', // Ensure proper spacing
        className,
      )}
    >
      {/* Logo area - left aligned with padding */}
      <div className="flex-shrink-0">
        <MobileLogo />
      </div>

      {/* Right side - badge and hamburger */}
      <div className="flex items-center gap-2">
        <MobileAuthBadge />
        <MobileHamburgerButton />
      </div>
    </div>
  );
}
