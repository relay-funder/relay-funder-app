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
import { RoundMainImageCard } from './main-image-card';

export function RoundCardEnhanced({
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
    <Card className="flex h-full flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg">
      <Link
        href={isAdmin ? `/admin/rounds/${round.id}` : `/rounds/${round.id}`}
        className="flex flex-grow flex-col"
        passHref
      >
        {/* Enhanced Image Section */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <RoundMainImageCard round={round} />
        </div>

        <CardHeader className="border-b p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold leading-tight tracking-tight">
                {round.title ?? 'Untitled Round'}
              </h2>
              <Badge variant={status.variant} className="shrink-0">
                {status.text}
              </Badge>
            </div>

            {/* Full Description - no truncation */}
            {round.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{round.description}</p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-4 p-6">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Matching Pool</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                ${round.matchingPool.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Campaigns</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {numberOfProjects}
              </p>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Round Period</span>
              </div>
              <span className="font-medium text-foreground">
                <FormattedDate date={new Date(round.startTime)} /> -{' '}
                <FormattedDate date={new Date(round.endTime)} />
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Applications</span>
              </div>
              <span className="font-medium text-foreground">
                <FormattedDate date={new Date(round.applicationStartTime)} /> -{' '}
                <FormattedDate date={new Date(round.applicationEndTime)} />
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Current Status</span>
              </div>
              <span className="font-medium text-foreground">{timeInfo}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-6 pt-0">
          <Button
            className="w-full"
            variant={status.text === 'Active' ? 'default' : 'outline'}
            size="lg"
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
