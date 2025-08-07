'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface VisibilityToggleProps {
  isVisible: boolean;
  duration?: number;
  transition?: boolean;
  children: React.ReactNode;
}

export function VisibilityToggle({
  isVisible,
  duration = 300,
  transition = true,
  children,
}: VisibilityToggleProps) {
  return (
    <div
      className={cn(
        transition
          ? cn(
              'grid',
              'transition-all ease-in-out',
              `duration-${duration}`,
              isVisible
                ? 'grid-rows-[1fr] opacity-100'
                : 'm-0 h-0 grid-rows-[0fr]',
            )
          : cn(isVisible ? 'block' : 'hidden'),
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
