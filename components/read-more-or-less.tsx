import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

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
      {collapsed ? (
        <Button variant="ghost" onClick={onToggleCollapsed}>
          Read More
        </Button>
      ) : (
        <Button variant="ghost" onClick={onToggleCollapsed}>
          Read Less
        </Button>
      )}
    </>
  );
}
