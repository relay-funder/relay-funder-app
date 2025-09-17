import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, DollarSign } from 'lucide-react';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '@/components/formatted-date';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { RoundMainImageAvatar } from './main-image-avatar';

export function RoundCardSelect({
  round,
  onSelect,
  disabled,
}: {
  round: GetRoundResponseInstance;
  onSelect?: (round: GetRoundResponseInstance) => Promise<void>;
  disabled: boolean;
}) {
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);
  const onClick = useCallback(async () => {
    if (disabled) {
      return;
    }
    if (typeof onSelect === 'function' && round) {
      return onSelect(round);
    }
  }, [round, onSelect, disabled]);
  if (!round || !round.id) {
    return (
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border p-4 shadow-sm">
        <p className="text-destructive">Error: Invalid round data.</p>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border shadow-sm',
        'transition-shadow hover:shadow-md',
        disabled && 'opacity-50',
      )}
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
    </Card>
  );
}
