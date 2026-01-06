'use client';

import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/contexts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

export function MobileHamburgerButton() {
  const { isOpen, toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'relative z-50 p-2 md:hidden',
        'bg-card shadow-md hover:bg-accent',
        'rounded-lg border border-border',
      )}
      onClick={toggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-foreground" />
      ) : (
        <Menu className="h-5 w-5 text-foreground" />
      )}
    </Button>
  );
}
