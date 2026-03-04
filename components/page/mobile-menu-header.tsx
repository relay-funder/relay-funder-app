'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeAwareImage } from '@/hooks/use-theme-logo';

export function MobileMenuHeader() {
  return (
    <div
      className={cn(
        'flex items-center justify-center border-b border-border p-4 md:hidden',
        'min-h-[80px]',
      )}
    >
      <Link href="/" className="flex cursor-pointer items-center">
        <ThemeAwareImage
          src="/relay-funder-logo.png"
          alt="RelayFunder"
          width={190}
          height={50}
          className="h-12 w-auto"
        />
      </Link>
    </div>
  );
}
