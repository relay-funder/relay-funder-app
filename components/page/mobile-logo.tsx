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
        'xs:h-14 xs:w-36 size-12', // Allocated area for logo (slightly increased) Original dimensions are 1:4 ratio
        'px-1 py-2', // Healthy padding around logo
      )}
    >
      <ThemeAwareImage
        src="/relay-funder-logo.png"
        alt="RelayFunder"
        width={150}
        height={38}
        className="xs:block mx-auto hidden w-auto" // Centered within allocated area
      />
      <ThemeAwareImage
        src="/relay-funder-logo-mark.png"
        alt="RelayFunder"
        width={150}
        height={38}
        className="xs:hidden mx-auto w-auto" // Centered within allocated area
      />
    </Link>
  );
}
