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
        'xs:h-14 xs:w-36', // Allocated area for logo (slightly increased) Original dimensions are 1:4 ratio
        'xxs:h-14 xxs:w-32', // Allocated area for logo (slightly increased) Original dimensions are 1:4 ratio
        'h-14 w-20', // Allocated area for logo (slightly increased) Original dimensions are 1:4 ratio
        'xs:px-1 xs:py-2', // Healthy padding around logo
      )}
    >
      <ThemeAwareImage
        src="/relay-funder-logo.svg"
        alt="RelayFunder"
        width={150}
        height={38}
        className="object-contain"
      />
    </Link>
  );
}
