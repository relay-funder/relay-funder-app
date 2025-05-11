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
  title: string;
  message?: string;
  featured?: boolean;
  tags?: string[];
  children?: ReactNode;
}) {
  return (
    <header className="mx-auto inline items-center justify-between p-8">
      {/* campaigns[slug] ^px-4 py-8 */}
      {/* campaigns[slug] <div className="space-y-4 pb-2> */}
      <div className="flex min-h-[100px] flex-wrap items-center gap-4 md:min-h-0">
        {/* campaigns[slug] <div className="flex items-center gap-2 py-1"> */}
        <div className="mb-8 flex flex-row items-center gap-2 py-1 md:mb-2 md:ml-4">
          <BackButton />
          {featured && (
            <Badge variant="secondary" className="px-3 py-1">
              Featured
            </Badge>
          )}
          <div className="flex flex-wrap">
            {tags?.map((tag) => (
              <span key={tag} className="pr-1 text-sm text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="ml-2 flex flex-col md:ml-4 md:content-start">
          {typeof message === 'string' && (
            <div className="text-sm text-muted-foreground">{message}</div>
          )}
          <h1 className="text-xl font-semibold sm:text-4xl">{title}</h1>
          {children ? (
            <div className="flex items-center py-2">{children}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
