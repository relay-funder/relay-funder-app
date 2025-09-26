import { useMemo } from 'react';
import BackButton from '@/components/back-button';
import { ReactNode } from 'react';
import { Badge } from '@/components/ui';
export function PageHeader({
  title,
  message,
  featured,
  tags,
  children,
}: {
  title?: string;
  message?: string;
  featured?: boolean;
  tags?: string[];
  children?: ReactNode;
}) {
  const headLine = useMemo(() => {
    const items = [];
    if (typeof message === 'string') {
      items.push(
        <div key="message" className="text-sm text-muted-foreground">
          {message}
        </div>,
      );
    }
    if (typeof title === 'string') {
      items.push(
        <h1 key="title" className="text-xl font-semibold sm:text-4xl">
          {title}
        </h1>,
      );
    }
    return items;
  }, [message, title]);
  const navLine = useMemo(() => {
    const items = [];
    if (featured) {
      items.push(
        <Badge key="featured" variant="secondary" className="px-3 py-1">
          Featured
        </Badge>,
      );
    }
    if (Array.isArray(tags) && tags.length) {
      items.push(
        <div key="tags" className="flex flex-wrap">
          {tags?.map((tag) => (
            <span key={tag} className="pr-1 text-sm text-gray-500">
              {tag}
            </span>
          ))}
        </div>,
      );
    }
    if (items.length === 0) {
      items.push(headLine);
    }
    return items;
  }, [featured, tags, headLine]);
  return (
    <header className="mt-1 inline items-center justify-between sm:mt-4 sm:p-8">
      {/* Mobile: constrained container, Desktop: original layout */}
      <div className="mx-auto max-w-5xl px-4 py-2 sm:mx-0 sm:max-w-none sm:px-0 sm:py-0">
        {/* campaigns[slug] ^px-4 py-8 */}
        {/* campaigns[slug] <div className="space-y-4 pb-2> */}
        <div className="flex min-h-[32px] flex-wrap items-center gap-2 sm:min-h-[75px] sm:gap-4 md:min-h-0">
          {/* campaigns[slug] <div className="flex items-center gap-2 py-1"> */}
          <div className="mb-1 flex flex-row items-center gap-2 py-1 sm:mb-8 md:mb-2 md:ml-4">
            <BackButton />
            {navLine}
          </div>
        </div>
        <div>
          <div className="ml-2 flex flex-col md:ml-4 md:content-start">
            {navLine[0] !== headLine && headLine}
            {children ? (
              <div className="flex items-center py-1 sm:py-2">{children}</div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
