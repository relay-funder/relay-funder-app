import { cn } from '@/lib/utils';
import { ReadMoreOrLess } from './read-more-or-less';

interface TimelineItemProps {
  date: Date;
  title: string;
  content: string;
  isLast?: boolean;
}

export function TimelineItem({
  date,
  title,
  content,
  isLast,
}: TimelineItemProps) {
  return (
    <div className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0">
      {/* Date */}
      <div className="text-sm text-gray-500">
        {new Date(date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="prose max-w-none">
          <ReadMoreOrLess
            className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600"
            collapsedClassName="line-clamp-3"
          >
            {content}
          </ReadMoreOrLess>
        </div>
      </div>
    </div>
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
    <div className={cn('space-y-6', className)}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          date={item.createdAt}
          title={item.title}
          content={item.content}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}
