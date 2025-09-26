'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useNewEventCount,
  useMarkEventFeedRead,
} from '@/lib/hooks/useEventFeed';

export function EventFeedBell() {
  const router = useRouter();
  const markRead = useMarkEventFeedRead();

  const newEventCount = useNewEventCount();

  const hasNewEvents = newEventCount > 0;
  const tooltipText = useMemo(() => {
    if (!hasNewEvents) return 'No new events';
    if (newEventCount >= 10) return 'At least 10 new events';
    return `${newEventCount} new event${newEventCount === 1 ? '' : 's'}`;
  }, [hasNewEvents, newEventCount]);

  const handleClick = () => {
    if (hasNewEvents) {
      markRead.mutate();
    }
    router.push('/profile/inbox');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={cn('relative', hasNewEvents && 'text-primary')}
          >
            <Bell className="h-5 w-5" />
            {hasNewEvents && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
