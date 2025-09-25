import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Clock, Calendar, DollarSign } from 'lucide-react';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '@/components/formatted-date';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import { useAuth } from '@/contexts';
import { useMemo, useCallback } from 'react';
import { DbCampaign } from '@/types/campaign';
import { useRemoveRoundCampaign } from '@/lib/hooks/useRounds';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { RoundMainImageAvatar } from './main-image-avatar';

export function RoundCardMinimal({
  round,
  campaign,
}: {
  round: GetRoundResponseInstance;
  campaign?: DbCampaign;
}) {
  const { isAdmin, address } = useAuth();
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);
  const { toast } = useToast();
  const { mutateAsync: removeRoundCampaign, isPending: isRemoving } =
    useRemoveRoundCampaign();
  const canWithdraw = useMemo(() => {
    if (!campaign) {
      return false;
    }
    const roundCampaign = round.roundCampaigns?.find(
      (roundCampaign) => roundCampaign.campaignId === campaign.id,
    );
    if (!roundCampaign) {
      return false;
    }
    if (!isAdmin && roundCampaign.campaign?.creatorAddress !== address) {
      return false;
    }
    return true;
  }, [round, campaign, address, isAdmin]);

  const handleRemove = useCallback(async () => {
    if (!campaign) return;

    try {
      await removeRoundCampaign({
        campaignId: campaign.id,
        roundId: round.id,
      });

      toast({
        title: 'Success',
        description: 'Campaign removed from round successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to remove campaign',
        variant: 'destructive',
      });
    }
  }, [campaign, round.id, removeRoundCampaign, toast]);
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
              <Calendar className="h-4 w-4" />
              <span>Timeline</span>
            </div>
            <span className="font-medium text-foreground">
              <FormattedDate date={new Date(round.startTime)} /> -{' '}
              <FormattedDate date={new Date(round.endTime)} />
            </span>
          </div>

          {/* Application Status - Show for the specific campaign */}
          {campaign && round.recipientStatus && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span>Application Status</span>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  round.recipientStatus === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : round.recipientStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {round.recipientStatus === 'APPROVED'
                  ? 'approved'
                  : round.recipientStatus === 'REJECTED'
                    ? 'rejected'
                    : 'pending'}
              </span>
            </div>
          )}

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
          {canWithdraw && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove();
              }}
              variant="destructive"
              size="sm"
              disabled={isRemoving}
              className="ml-2"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Withdraw Application
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
