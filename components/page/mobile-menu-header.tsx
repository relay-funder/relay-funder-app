'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MobileMenuHeader() {
  return (
    <div
      className={cn(
        'flex items-center justify-center border-b border-gray-200 p-4 md:hidden',
        'min-h-[80px]',
      )}
    >
      <Link href="/" className="flex cursor-pointer items-center">
        <Image
          src="/relay-funder-logo.png"
          alt="RelayFunder"
          width={160}
          height={42}
          className="h-10 w-auto"
        />
      </Link>
    </div>
  );
}
