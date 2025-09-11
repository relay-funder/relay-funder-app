import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Clock, Calendar, DollarSign } from 'lucide-react';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '@/components/formatted-date';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import { useAuth } from '@/contexts';

export function RoundCardMinimal({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);

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
            <Avatar className="h-12 w-12 border">
              {round.logoUrl ? (
                <AvatarImage
                  src={round.logoUrl}
                  alt={`${round.title} logo`}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {round.title ? round.title.charAt(0).toUpperCase() : 'R'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-lg font-semibold leading-tight tracking-tight">
                  {round.title ?? 'Untitled Round'}
                </h2>
                <Badge variant={status.variant} className="shrink-0 text-xs">
                  {status.text}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {round.description ?? 'No description.'}
              </p>
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
              <Clock className="h-4 w-4" />
              <span>Status</span>
            </div>
            <span className="font-medium text-foreground">{timeInfo}</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-4 pt-0">
          <Button
            className="w-full"
            variant={status.text === 'Ended' ? 'default' : 'ghost'}
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
