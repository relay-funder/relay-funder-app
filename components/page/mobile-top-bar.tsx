'use client';

import { cn } from '@/lib/utils';
import { MobileLogo } from './mobile-logo';
import { MobileAuthBadge } from './mobile-auth-indicator';
import { MobileHamburgerButton } from './mobile-hamburger-button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function MobileTopBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative h-16 w-full border-b border-border bg-background md:hidden',
        'flex items-center justify-between px-2 xs:px-4', // Ensure proper spacing
        className,
      )}
    >
      {/* Logo area - left aligned with padding */}
      <div className="flex-shrink-0">
        <MobileLogo />
      </div>

      {/* Right side - badge, theme toggle, and hamburger */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <MobileAuthBadge />
        <MobileHamburgerButton />
      </div>
    </div>
  );
}
