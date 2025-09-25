'use client';

import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LoadMoreButton({
  onLoadMore,
  hasMore,
  isLoading,
  className,
  children = 'Load more',
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={cn('flex justify-center py-6', className)}>
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-[140px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            {children}
          </>
        )}
      </Button>
    </div>
  );
}
