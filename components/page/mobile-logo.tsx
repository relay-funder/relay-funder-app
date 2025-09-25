'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MobileLogo() {
  return (
    <Link
      href="/"
      className={cn(
        'relative z-20 md:hidden',
        'flex cursor-pointer items-center justify-start',
        'h-14 w-36', // Allocated area for logo (slightly increased)
        'px-1 py-2', // Healthy padding around logo
      )}
    >
      <Image
        src="/relay-funder-logo.png"
        alt="RelayFunder"
        width={150}
        height={38}
        className="mx-auto w-auto" // Centered within allocated area
      />
    </Link>
  );
}
