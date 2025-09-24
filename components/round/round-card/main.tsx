'use client';

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
import { FormattedDate } from '@/components/formatted-date';
import { useMemo } from 'react';
import { useRoundStatus } from '../use-status';
import { useRoundTimeInfo } from '../use-time-info';
import { useAuth } from '@/contexts';
import { RoundMainImageCard } from '../main-image-card';
import { RoundMainImageAvatar } from '../main-image-avatar';
import { RoundCardProps, getDefaultRoundDisplayOptions } from './types';

/**
 * Unified Round Card Component
 *
 * Supports two display modes:
 * - standard: Basic round info with essential stats
 * - enhanced: Extended stats grid with full details
 *
 * @example
 * ```tsx
 * // Standard round card
 * <RoundCard round={round} type="standard" />
 *
 * // Enhanced round card with full stats
 * <RoundCard round={round} type="enhanced" />
 * ```
 */
export function RoundCard({
  round,
  type = 'standard',
  displayOptions: userDisplayOptions = {},
  className,
}: RoundCardProps) {
  const { isAdmin } = useAuth();
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);

  // Merge user display options with type defaults
  const displayOptions = {
    ...getDefaultRoundDisplayOptions(type),
    ...userDisplayOptions,
  };

  const numberOfProjects = useMemo(() => {
    return round.roundCampaigns?.length ?? 0;
  }, [round]);

  const isEnhancedType = type === 'enhanced';

  if (!round || !round.id) {
    return (
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border p-4 shadow-sm">
        <p className="text-destructive">Error: Invalid round data.</p>
      </Card>
    );
  }

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md ${className || ''}`}
    >
      <CardHeader className="flex-shrink-0 p-4">
        <div className="flex items-start gap-4">
          {/* Round Image */}
          {isEnhancedType ? (
            <RoundMainImageCard round={round} />
          ) : (
            <RoundMainImageAvatar round={round} />
          )}

          {/* Round Info */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="line-clamp-2 text-lg font-semibold leading-tight">
                {round.title ?? 'Untitled Round'}
              </h2>
              <Badge variant={status.variant} className="shrink-0 text-xs">
                {status.text}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3 p-4 pt-0">
        {isEnhancedType && displayOptions.showFullStats ? (
          // Enhanced Stats Grid
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Projects</span>
              </div>
              <p className="text-lg font-semibold">{numberOfProjects}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Funding Goal</span>
              </div>
              <p className="text-lg font-semibold">
                ${round.matchingPool?.toLocaleString() ?? '0'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Start Date</span>
              </div>
              <p className="text-sm">
                {round.startTime ? (
                  <FormattedDate date={new Date(round.startTime)} />
                ) : (
                  'TBD'
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>End Date</span>
              </div>
              <p className="text-sm">
                {round.endTime ? (
                  <FormattedDate date={new Date(round.endTime)} />
                ) : (
                  'TBD'
                )}
              </p>
            </div>
          </div>
        ) : (
          // Standard Stats Row
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{numberOfProjects} projects</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${round.matchingPool?.toLocaleString() ?? '0'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{timeInfo}</span>
            </div>
          </div>
        )}
      </CardContent>

      {displayOptions.showActionButton && (
        <CardFooter className="flex-shrink-0 p-4 pt-0">
          <Button
            asChild
            variant={isAdmin ? 'default' : 'outline'}
            className="w-full"
          >
            <Link
              href={
                isAdmin ? `/admin/rounds/${round.id}` : `/rounds/${round.id}`
              }
              className="flex items-center justify-center gap-2"
            >
              {isAdmin ? 'Manage Round' : 'View Round'}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
