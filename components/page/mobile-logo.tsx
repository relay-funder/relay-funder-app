'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeAwareImage } from '@/hooks/use-theme-logo';

export function MobileLogo() {
  return (
    <Link
      href="/"
      className={cn(
        'relative z-20 md:hidden',
        'flex cursor-pointer items-center justify-start',
        'xs:h-16 xs:w-40',
        'xxs:h-16 xxs:w-36',
        'h-16 w-24',
        'xs:px-1 xs:py-2', // Healthy padding around logo
      )}
    >
      <ThemeAwareImage
        src="/relay-funder-logo.svg"
        alt="RelayFunder"
        width={178}
        height={46}
        className="object-contain"
      />
    </Link>
  );
}
