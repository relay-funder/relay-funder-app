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
import { Loader2 } from 'lucide-react';
import { RoundMainImageAvatar } from './main-image-avatar';
import { useConfirm } from '@/hooks/use-confirm';

export function RoundCardMinimal({
  round,
  campaign,
  forceUserView = false,
}: {
  round: GetRoundResponseInstance;
  campaign?: DbCampaign;
  forceUserView?: boolean;
}) {
  const { isAdmin: authIsAdmin, address } = useAuth();

  // Force user view if specified, otherwise use actual admin status
  const isAdmin = forceUserView ? false : authIsAdmin;
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);
  const { toast } = useToast();
  const { mutateAsync: removeRoundCampaign, isPending: isRemoving } =
    useRemoveRoundCampaign();
  const { confirm } = useConfirm();

  const canRemove = useMemo(() => {
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

  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!campaign) return;

      const confirmed = await confirm({
        title: 'Are you absolutely sure?',
        description: (
          <>
            This action cannot be undone. This will permanently remove the
            campaign &quot;
            <span className="font-semibold">
              {campaign?.title ?? 'Untitled Campaign'}
            </span>
            &quot; from the round &quot;
            <span className="font-semibold">
              {round.title ?? 'Untitled Round'}
            </span>
            &quot;.
          </>
        ),
        onConfirm: async () => {
          await removeRoundCampaign({
            campaignId: campaign.id,
            roundId: round.id,
          });
        },
        confirmText: 'Remove',
        confirmVariant: 'destructive',
        isConfirming: isRemoving,
      });

      if (confirmed) {
        toast({
          title: 'Success',
          description: 'Campaign removed from round successfully',
        });
      } else if (isRemoving) {
        // If `isRemoving` is true, it means the user clicked 'Remove' in the dialog
        // but the promise resolved to false, likely due to an error in onConfirm
        toast({
          title: 'Error',
          description: 'Failed to remove campaign',
          variant: 'destructive',
        });
      }
    },
    [
      campaign,
      round.id,
      round.title,
      removeRoundCampaign,
      toast,
      confirm,
      isRemoving,
    ],
  );

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
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="truncate text-lg font-semibold leading-tight tracking-tight">
                {round.title ?? 'Untitled Round'}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant={status.variant} className="text-xs">
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
                className={`rounded-md px-2 py-1 text-xs font-normal ${
                  round.recipientStatus === 'APPROVED'
                    ? 'border border-green-200 bg-green-50 text-green-600'
                    : round.recipientStatus === 'REJECTED'
                      ? 'border border-red-200 bg-red-50 text-red-600'
                      : 'border border-gray-200 bg-gray-50 text-gray-600'
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
          <div className="flex w-full gap-2">
            <Button
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              variant={status.text === 'Ended' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <span>
                {status.text === 'Ended' ? 'View Results' : 'View Round'}
              </span>
            </Button>
            {canRemove && (
              <Button
                onClick={handleRemove}
                variant="ghost"
                size="sm"
                disabled={isRemoving}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
