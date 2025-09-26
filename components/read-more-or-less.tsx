import { cn } from '@/lib/utils';
import { useCallback, useState, useMemo } from 'react';

export function ReadMoreOrLess({
  children,
  className,
  collapsedClassName = 'line-clamp-6',
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

    // Extract the line clamp number from className
    const lineClampMatch = collapsedClassName.match(/line-clamp-(\d+)/);
    const lineClampNumber = lineClampMatch
      ? parseInt(lineClampMatch[1], 10)
      : 6;

    // Rough estimation: assume ~80 characters per line for typical text
    const estimatedCharsPerLine = 80;
    const threshold = lineClampNumber * estimatedCharsPerLine;

    // Also check for line breaks which would create additional lines
    const lineBreaks = (children.match(/\n/g) || []).length;
    const hasSignificantContent =
      children.length > threshold || lineBreaks >= lineClampNumber;

    return hasSignificantContent;
  }, [children, collapsedClassName]);

  return (
    <>
      <p
        className={cn(
          collapsed &&
            (collapsedClassName ? collapsedClassName : 'line-clamp-6'),
          className ? className : 'text-muted-foreground',
        )}
      >
        {children}
      </p>
      {showToggle &&
        (collapsed ? (
          <button
            onClick={onToggleCollapsed}
            className="text-sm text-gray-900 hover:text-gray-700 hover:underline focus:underline focus:outline-none"
          >
            Read more
          </button>
        ) : (
          <button
            onClick={onToggleCollapsed}
            className="text-sm text-gray-900 hover:text-gray-700 hover:underline focus:underline focus:outline-none"
          >
            Read less
          </button>
        ))}
    </>
  );
}
