import { useSidebar } from '@/contexts';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { transition } from './sidebar-constants';

export function PageNavMenuIcon() {
  const { isOpen } = useSidebar();
  return (
    <div
      className={cn(
        'max-h-[100px] min-h-[100px] flex-1 items-center justify-center border-b px-4',
        transition,
        isOpen ? 'pt-6' : 'pt-8',
      )}
    >
      <Link
        href="/"
        className={cn(
          'justify-left flex w-full cursor-pointer items-center',
          '',
        )}
      >
        <div
          className={cn(
            'relative h-[56px] overflow-hidden',
            transition,
            isOpen ? 'w-[240px]' : 'w-[75px]',
          )}
        >
          <div
            className={cn(
              'absolute left-0 top-0',
              transition,
              !isOpen ? 'w-[150px] opacity-0' : 'w-[200px] opacity-100',
            )}
          >
            <Image
              src="/relay-funder-logo.png"
              alt="RelayFunder Logo"
              width={474}
              height={128}
              className={cn('rounded-full')}
            />
          </div>
          <div
            className={cn(
              'absolute left-0 top-0',
              transition,
              isOpen ? 'w-[55px] opacity-0' : 'w-[38px] opacity-100',
            )}
          >
            <Image
              src="/relay-funder-logo-mark.png"
              alt="RelayFunder Mark"
              width={129}
              height={128}
              className={cn('rounded')}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
