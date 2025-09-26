'use client';

import { useCallback } from 'react';
import { BellRing, CheckCheck, Loader2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EventFeedList } from './event-feed-list';
import {
  useMarkEventFeedRead,
  useNewEventCount,
} from '@/lib/hooks/useEventFeed';

export function Inbox() {
  const { mutate: markRead, isPending: markingRead } = useMarkEventFeedRead();
  const newEventCount = useNewEventCount();

  const handleMarkRead = useCallback(() => {
    markRead();
  }, [markRead]);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Inbox</CardTitle>
            <CardDescription>
              {newEventCount === 0
                ? "You're all caught up with your notifications."
                : 'Track important activity across your campaigns and contributions.'}
            </CardDescription>
          </div>
        </div>
        <Button
          type="button"
          variant={newEventCount === 0 ? 'outline' : 'secondary'}
          size="sm"
          onClick={handleMarkRead}
          disabled={markingRead || newEventCount === 0}
          className="inline-flex items-center gap-2"
        >
          {markingRead ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating…
            </>
          ) : newEventCount === 0 ? (
            <>
              <CheckCheck className="h-4 w-4" />
              All read
            </>
          ) : (
            <>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </>
          )}
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <EventFeedList />
      </CardContent>
    </Card>
  );
}

export default Inbox;
