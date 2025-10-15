'use client';

import { Badge } from '@/components/ui/badge';
import { useCampaignRounds } from '@/hooks/use-campaign-rounds';
import { DbCampaign } from '@/types/campaign';
import { Rocket, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

interface RoundBadgeProps {
  campaign?: DbCampaign;
  variant?: 'compact' | 'detailed' | 'minimal';
  className?: string;
  showUpcomingRounds?: boolean; // New prop to control upcoming rounds visibility
  showPendingStatus?: boolean; // New prop to control pending status visibility
}

export function CampaignRoundBadge({
  campaign,
  variant = 'detailed',
  className = '',
  showUpcomingRounds = true,
  showPendingStatus = true,
}: RoundBadgeProps) {
  const { activeRounds, pastRounds, futureRounds, hasRounds } =
    useCampaignRounds({
      campaign,
      includePendingInFuture: showPendingStatus,
    });

  // Determine the most relevant round to display
  const displayRound = useMemo(() => {
    // Prioritize active rounds first
    if (activeRounds.length > 0) {
      return {
        round: activeRounds[0],
        status: 'active' as const,
        icon: Rocket,
        label: 'Active Match',
        color: 'bg-green-100 text-green-800 border-green-300',
        iconColor: 'text-green-600',
      };
    }

    // Then future rounds (only if showUpcomingRounds is true)
    if (showUpcomingRounds && futureRounds.length > 0) {
      return {
        round: futureRounds[0],
        status: 'upcoming' as const,
        icon: Clock,
        label: 'Upcoming Match',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        iconColor: 'text-blue-600',
      };
    }

    // Finally past rounds
    if (pastRounds.length > 0) {
      return {
        round: pastRounds[0],
        status: 'past' as const,
        icon: CheckCircle,
        label: 'Past Match',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        iconColor: 'text-gray-500',
      };
    }

    return null;
  }, [activeRounds, futureRounds, pastRounds, showUpcomingRounds]);

  if (!hasRounds || !displayRound) {
    return null;
  }

  const { round, status, icon: Icon, label, color, iconColor } = displayRound;

  // Compact version - just an icon with tooltip
  if (variant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center ${className}`}
        title={`${label}: ${round.title}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
    );
  }

  // Compact version - small badge
  if (variant === 'compact') {
    return (
      <Badge
        variant="secondary"
        className={`${color} inline-flex items-center gap-1 text-xs font-medium ${className}`}
        title={round.title}
      >
        <Icon className="h-3 w-3" />
        {status === 'active' && '🔥'}
        {status === 'upcoming' && '⏳'}
        {status === 'past' && '✅'}
        Match
      </Badge>
    );
  }

  // Detailed version - full information
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Badge
        variant="secondary"
        className={`${color} flex w-full max-w-full items-center gap-1.5 px-4 py-2 font-medium`}
      >
        <div className="flex items-center gap-1">
          <Icon className="h-4 w-4" />
          {status === 'active' && (
            <Sparkles className="h-3 w-3 animate-pulse" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <div className="text-xs font-semibold leading-tight">
            {status === 'active'
              ? '🔥 Active Match'
              : status === 'upcoming'
                ? '⏳ Upcoming Match'
                : '✅ Past Match'}
          </div>
          <div className="w-full truncate text-xs leading-tight opacity-90">
            {round.title}
          </div>
        </div>
        {activeRounds.length + futureRounds.length + pastRounds.length > 1 && (
          <div className="flex-shrink-0 text-xs font-bold">
            +{activeRounds.length + futureRounds.length + pastRounds.length - 1}
          </div>
        )}
      </Badge>
    </div>
  );
}

// Legacy export for backwards compatibility
export const CampaignRoundsIndicator = CampaignRoundBadge;
