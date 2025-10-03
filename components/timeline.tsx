import { cn } from '@/lib/utils';
import { ReadMoreOrLess } from './read-more-or-less';
import { Card, CardContent } from '@/components/ui';

interface TimelineItemProps {
  id: string;
  date: Date;
  title: string;
  content: string;
  isLast?: boolean;
}

export function TimelineItem({ id, date, title, content }: TimelineItemProps) {
  return (
    <Card id={`update-${id}`} className="scroll-mt-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <span className="text-sm text-muted-foreground">
                {new Date(date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="prose mt-2 max-w-none">
              <ReadMoreOrLess
                className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
                collapsedClassName="line-clamp-3"
              >
                {content}
              </ReadMoreOrLess>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineProps {
  items: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
  }>;
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          id={item.id}
          date={item.createdAt}
          title={item.title}
          content={item.content}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}
