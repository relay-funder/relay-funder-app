import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Clock, Calendar, Users, DollarSign } from 'lucide-react';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '@/components/formatted-date';
import { useMemo } from 'react';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import { useAuth } from '@/contexts';
import { RoundMainImageAvatar } from './main-image-avatar';

export function RoundCardDashboard({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);

  const numberOfProjects = useMemo(() => {
    return round.roundCampaigns?.length ?? 0;
  }, [round]);

  if (!round || !round.id) {
    return (
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border p-4 shadow-sm">
        <p className="text-destructive">Error: Invalid round data.</p>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={isAdmin ? `/admin/rounds/${round.id}` : `/rounds/${round.id}`}
        className="flex flex-grow flex-col"
        passHref
      >
        <CardHeader className="border-b p-4">
          <div className="flex items-start gap-4">
            <RoundMainImageAvatar round={round} />

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-lg font-semibold leading-tight tracking-tight">
                  {round.title ?? 'Untitled Round'}
                </h2>
                <Badge variant={status.variant} className="shrink-0 text-xs">
                  {status.text}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-3 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Matching Pool</span>
            </div>
            <span className="font-medium text-foreground">
              ${round.matchingPool.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Campaigns</span>
            </div>
            <span className="font-medium text-foreground">
              {numberOfProjects !== undefined
                ? numberOfProjects?.toString()
                : '0'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Timeline</span>
            </div>
            <span className="font-medium text-foreground">
              <FormattedDate date={new Date(round.startTime)} /> -{' '}
              <FormattedDate date={new Date(round.endTime)} />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Application Timeline</span>
            </div>
            <span className="font-medium text-foreground">
              <FormattedDate date={new Date(round.applicationStartTime)} /> -{' '}
              <FormattedDate date={new Date(round.applicationEndTime)} />
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Status</span>
            </div>
            <span className="font-medium text-foreground">{timeInfo}</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-4 pt-0">
          <Button
            className="w-full"
            variant={status.text === 'Active' ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <span>
              {status.text === 'Ended' ? 'View Results' : 'View Round'}
            </span>
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
