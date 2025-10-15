'use client';

import { useState } from 'react';
import { Button } from './button';

interface ReadMoreDescriptionProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ReadMoreDescription({
  text,
  maxLength = 200,
  className = '',
}: ReadMoreDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  const displayText =
    isExpanded || !shouldTruncate ? text : text.slice(0, maxLength) + '...';

  return (
    <div className={className}>
      <p className="text-lg leading-relaxed text-muted-foreground">
        {displayText}
      </p>
      {shouldTruncate && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 h-auto p-0 text-primary hover:text-primary/80"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </div>
  );
}
