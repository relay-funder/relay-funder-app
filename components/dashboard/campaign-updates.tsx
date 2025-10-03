'use client';

import {
  useInfiniteUserUpdates,
  type UserUpdate,
} from '@/lib/hooks/useUserUpdates';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { Calendar, ExternalLink, Bell, MessageSquare } from 'lucide-react';
import { Category } from '@/components/shared/category';
import Link from 'next/link';
import Image from 'next/image';

interface UpdateCardProps {
  update: UserUpdate;
}

function UpdateCard({ update }: UpdateCardProps) {
  const { campaign } = update;

  return (
    <Card className="overflow-hidden bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        {/* Campaign Header */}
        <div className="border-b border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            {campaign.image ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="block truncate text-sm font-medium text-foreground hover:text-accent-foreground hover:underline"
              >
                {campaign.title}
              </Link>
              <div className="flex items-center text-xs text-muted-foreground">
                <Category categoryId={campaign.category} className="text-xs" />
                {campaign.location && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{campaign.location}</span>
                  </>
                )}
              </div>
            </div>

            <Badge variant="secondary" className="shrink-0">
              {campaign.status.toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* Update Content */}
        <div className="p-4">
          <div className="mb-3">
            <Link
              href={`/campaigns/${campaign.slug}#update-${update.id}`}
              className="text-lg font-semibold text-foreground hover:text-accent-foreground hover:underline"
            >
              {update.title}
            </Link>
          </div>

          {/* Update content preview */}
          <div className="mb-4">
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {update.content.length > 150
                ? `${update.content.substring(0, 150)}...`
                : update.content}
            </p>
          </div>

          {/* Update media preview */}
          {update.media && update.media.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                {update.media.slice(0, 2).map((media, index) => (
                  <div
                    key={index}
                    className="relative h-20 overflow-hidden rounded-md"
                  >
                    <Image
                      src={media.url}
                      alt={media.caption || `Update media ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {update.media.length > 2 && (
                  <div className="flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    +{update.media.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Update metadata */}
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(update.createdAt).toLocaleDateString()}
            </div>

            <Link
              href={`/campaigns/${campaign.slug}#update-${update.id}`}
              className="flex items-center gap-1 font-medium text-accent-foreground hover:text-accent-foreground/80"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Update
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignUpdates() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserUpdates({ pageSize: 6 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (loading && !data) {
    return <CampaignLoading minimal={true} />;
  }

  if (error) {
    return <CampaignError error={error.message} />;
  }

  const updates = data?.pages.flatMap((page) => page.updates) || [];

  if (updates.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium text-foreground">
          No updates yet
        </h3>
        <p className="mb-4 text-muted-foreground">
          Updates from campaigns you&apos;ve contributed to or favorited will
          appear here.
        </p>
        <p className="text-sm text-muted-foreground">
          Start contributing to or favoriting campaigns to see their latest
          updates and announcements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {updates.map((update) => (
          <UpdateCard key={update.id} update={update} />
        ))}
      </div>

      {/* Loading indicator */}
      {isFetchingNextPage && <CampaignLoading minimal={true} />}

      {/* Intersection observer target */}
      <div ref={ref} className="h-10" />
    </div>
  );
}
