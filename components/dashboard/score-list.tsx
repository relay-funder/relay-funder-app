'use client';

import { useUserScore } from '@/lib/hooks/useUserScore';
import { useUserScoreEvents } from '@/lib/hooks/useUserScoreEvents';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { ScoreExplanationModal } from '@/components/score-explanation-modal';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { INFINITE_SCROLL_CONFIG } from '@/lib/constant';
import {
  Heart,
  MessageCircle,
  UserCheck,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Minus,
  Flower2,
  Share2,
  Info,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui';
import type { ScoreEvent } from '@/lib/api/types';

function ScoreEventItem({ event }: { event: ScoreEvent }) {
  const getIcon = () => {
    switch (event.type) {
      case 'CampaignPayment':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'CampaignComment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'ProfileCompleted':
        return <UserCheck className="h-5 w-5 text-purple-500" />;
      case 'CampaignApprove':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CampaignDisable':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'CampaignUpdate':
        return <Edit className="h-5 w-5 text-orange-500" />;
      case 'CampaignShare':
        return <Share2 className="h-5 w-5 text-pink-500" />;
      default:
        return <Flower2 className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {getIcon()}
            </div>
            <div>
              <h4 className="font-medium text-foreground">{event.action}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(event.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 font-semibold ${
              event.points > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {event.points > 0 ? (
              <Plus className="h-4 w-4" />
            ) : event.points < 0 ? (
              <Minus className="h-4 w-4" />
            ) : null}
            <span>{Math.abs(event.points)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreEventSkeleton() {
  return (
    <Card className="bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ScoreItemProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  action: string;
  valueColor?: string;
}

function ScoreItem({
  icon,
  title,
  value,
  action,
  valueColor = 'text-green-600',
}: ScoreItemProps) {
  return (
    <Card className="bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {icon}
            </div>
            <div>
              <h4 className="font-medium text-foreground">{title}</h4>
              <p className="text-sm text-muted-foreground">{action}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 font-semibold ${valueColor}`}
          >
            {value > 0 ? (
              <Plus className="h-4 w-4" />
            ) : value < 0 ? (
              <Minus className="h-4 w-4" />
            ) : null}
            <span>{Math.abs(value)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScoreList() {
  const {
    data: score,
    isLoading: scoreLoading,
    error: scoreError,
  } = useUserScore();
  const { ref, inView } = useInView();
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserScoreEvents({ pageSize: 10 });
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const isLoading = scoreLoading || (eventsLoading && !eventsData);
  const error = scoreError || eventsError;

  const currentPageCount = eventsData?.pages.length ?? 0;
  const shouldAutoFetch =
    currentPageCount < INFINITE_SCROLL_CONFIG.MAX_AUTO_PAGES;
  const shouldShowLoadMore = !shouldAutoFetch && hasNextPage;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && shouldAutoFetch) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, shouldAutoFetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Flower2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <Skeleton className="mb-2 h-8 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            <ScoreEventSkeleton />
            <ScoreEventSkeleton />
            <ScoreEventSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <CampaignError error={error.message} />;
  }

  const totalScore = score?.totalScore ?? 0;

  if (totalScore === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <Flower2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Karma
                  </h2>
                  <p className="text-muted-foreground">
                    Total:{' '}
                    <span className="font-semibold text-primary">0 karma</span>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanationModal(true)}
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                How it works
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Flower2 className="mt-0.5 h-6 w-6 text-primary" />
              <div>
                <h4 className="mb-3 text-lg font-semibold text-foreground">
                  Start Building Your Karma!
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your journey to making a difference starts here. Complete your
                  profile, make your first donation, or create a campaign to
                  begin earning karma points. Every action counts toward
                  building a better world!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ScoreExplanationModal
          open={showExplanationModal}
          onOpenChange={setShowExplanationModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Flower2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Your Karma
                </h2>
                <p className="text-muted-foreground">
                  Total:{' '}
                  <span className="font-semibold text-primary">
                    {totalScore} karma
                  </span>
                  {score && (
                    <span className="ml-2 text-sm">
                      (Creator: {score.creatorScore} • Donor:{' '}
                      {score.receiverScore})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanationModal(true)}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              How it works
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {eventsData?.pages.map((page) =>
            page.events.map((event) => (
              <ScoreEventItem key={event.id} event={event} />
            )),
          )}
          {(!eventsData?.pages ||
            eventsData.pages.every((page) => page.events.length === 0)) && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center text-muted-foreground">
                No recent activity found.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isFetchingNextPage && <ScoreEventSkeleton />}

      {shouldShowLoadMore && (
        <LoadMoreButton
          onLoadMore={handleLoadMore}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      )}

      {shouldAutoFetch && <div ref={ref} className="h-10" />}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> Keep engaging with the platform to build
            your karma! Every donation, comment, and campaign update contributes
            to your humanitarian impact.
          </p>
        </CardContent>
      </Card>

      <ScoreExplanationModal
        open={showExplanationModal}
        onOpenChange={setShowExplanationModal}
      />
    </div>
  );
}
