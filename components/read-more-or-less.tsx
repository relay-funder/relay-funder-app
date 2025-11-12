import { cn } from '@/lib/utils';
import { useCallback, useState, useMemo } from 'react';

export function ReadMoreOrLess({
  children,
  className,
  collapsedClassName = 'line-clamp-3',
}: {
  children: React.ReactNode;
  className?: string;
  collapsedClassName?: string;
}) {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const onToggleCollapsed = useCallback(() => {
    setCollapsed((prevState) => !prevState);
  }, []);

  // Determine if content is long enough to warrant a Read More button
  const showToggle = useMemo(() => {
    if (typeof children !== 'string') return false;
    if (!children.trim()) return false;

    // Extract the line clamp number from className
    const lineClampMatch = collapsedClassName.match(/line-clamp-(\d+)/);
    const lineClampNumber = lineClampMatch
      ? parseInt(lineClampMatch[1], 10)
      : 3;

    // More conservative estimation: ~60 characters per line (accounting for spacing and wrapping)
    const estimatedCharsPerLine = 60;
    const threshold = lineClampNumber * estimatedCharsPerLine;

    // Check for explicit line breaks
    const lineBreaks = (children.match(/\n/g) || []).length;

    // Check for very long words that might cause wrapping
    const longWords = children.split(/\s+/).filter(word => word.length > 20);
    const longWordsTotalLength = longWords.reduce((sum, word) => sum + word.length, 0);
    const longWordsProportion = children.length > 0 ? longWordsTotalLength / children.length : 0;

    // Show toggle if content significantly exceeds the line limit
    const exceedsByLength = children.length > threshold * 1.2; // 20% buffer
    const exceedsByLines = lineBreaks >= lineClampNumber; // Include exact matches
    const hasLongWords = longWordsProportion > 0.3; // Require significant proportion of long words

    return exceedsByLength || exceedsByLines || hasLongWords;
  }, [children, collapsedClassName]);

  return (
    <>
      <p
        className={cn(
          collapsed &&
            (collapsedClassName ? collapsedClassName : 'line-clamp-3'),
          className ? className : 'text-muted-foreground',
        )}
      >
        {children}
      </p>
      {showToggle &&
        (collapsed ? (
          <button
            onClick={onToggleCollapsed}
            className="text-sm text-foreground hover:underline focus:underline focus:outline-none"
          >
            Read more
          </button>
        ) : (
          <button
            onClick={onToggleCollapsed}
            className="text-sm text-foreground hover:text-accent-foreground hover:underline focus:underline focus:outline-none"
          >
            Read less
          </button>
        ))}
    </>
  );
}
