'use client';

import { useState, useCallback } from 'react';
import { BellRing, CheckCheck, Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/page/layout';
import { Button } from '@/components/ui/button';
import { AdminEventFeedList } from './admin-event-feed-list';
import {
  useMarkEventFeedRead,
  useNewEventCount,
} from '@/lib/hooks/useEventFeed';

export function AdminEventFeedExplore() {
  const [searchTerm, setSearchTerm] = useState('');
  const { mutate: markRead, isPending: markingRead } = useMarkEventFeedRead();
  const newEventCount = useNewEventCount();

  const handleMarkRead = useCallback(() => {
    markRead();
  }, [markRead]);

  return (
    <PageLayout
      title="Event Feed"
      searchPlaceholder="Search Events"
      onSearchChanged={setSearchTerm}
      containerWidth="default"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellRing className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">Admin Event Feed</h2>
              <p className="text-sm text-muted-foreground">
                {newEventCount === 0
                  ? "You're all caught up with admin notifications."
                  : 'View all events across all users and campaigns.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant={newEventCount === 0 ? 'outline' : 'secondary'}
            size="sm"
            onClick={handleMarkRead}
            disabled={markingRead || newEventCount === 0}
            className="inline-flex shrink-0 items-center gap-2"
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
        </div>

        <AdminEventFeedList
          filters={searchTerm ? { type: searchTerm } : undefined}
        />
      </div>
    </PageLayout>
  );
}

export default AdminEventFeedExplore;
