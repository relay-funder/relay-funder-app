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
        'bg-white shadow-md hover:bg-gray-50',
        'rounded-lg border border-gray-200',
      )}
      onClick={toggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-gray-700" />
      ) : (
        <Menu className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );
}
