'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface VisibilityToggleProps {
  isVisible: boolean;
  duration?: number;
  children: React.ReactNode;
}

export function VisibilityToggle({
  isVisible,
  duration = 300,
  children,
}: VisibilityToggleProps) {
  return (
    <div
      className={cn(
        'grid transition-all ease-in-out',
        `duration-${duration}`,
        isVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
