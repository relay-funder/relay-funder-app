'use client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useCallback, useMemo, useState } from 'react';
import { useCreateRoundCampaign, useRounds } from '@/lib/hooks/useRounds';
import { DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';
import { GetRoundResponseInstance } from '@/lib/api/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function CampaignAddRoundDialog({
  campaign,
  onClosed,
}: {
  campaign: DbCampaign;
  onClosed?: () => void;
}) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [applicationReason, setApplicationReason] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<
    GetRoundResponseInstance | undefined
  >();
  const {
    data: roundsData,
    isPending: isRoundsDataPending,
  } = useRounds();

  const canAdd = useMemo(() => {
    if (isRoundsDataPending || !selectedRound) {
      return false;
    }
    if (page === 1 && applicationReason.trim() === '') {
      return false;
    }
    if (
      campaign.rounds?.find((campaignRound) => {
        return campaignRound.id === selectedRound.id;
      })
    ) {
      return false;
    }
    return typeof selectedRound !== 'undefined';
  }, [selectedRound, campaign, isRoundsDataPending, applicationReason, page]);
  const { mutateAsync: createRoundCampaign, isPending } =
    useCreateRoundCampaign();
  const onClose = useCallback(() => {
    setSelectedRound(undefined);
    typeof onClosed === 'function' && onClosed();
  }, [onClosed]);

  // Filter out rounds where the application deadline has passed or campaign is already applied
  const availableRounds = useMemo(() => {
    if (roundsData && Array.isArray(roundsData)) {
      const now = new Date();

      const filtered = roundsData.filter((round: GetRoundResponseInstance) => {
        const applicationEndTime = new Date(round.applicationEndTime);
        const deadlinePassed = applicationEndTime < now;
        const alreadyApplied = campaign.rounds?.find((campaignRound) => {
          return campaignRound.id === round.id;
        });

        // Check if application deadline has passed
        if (deadlinePassed) {
          return false;
        }
        // Check if campaign is already applied to this round
        if (alreadyApplied) {
          return false;
        }
        return true;
      });

      return filtered;
    }
    return [] as GetRoundResponseInstance[];
  }, [roundsData, campaign]);

  const onRoundSelected = useCallback(
    (roundId: string) => {
      const round = availableRounds.find(
        (r: GetRoundResponseInstance) => r.id.toString() === roundId,
      );
      setSelectedRound(round);
    },
    [availableRounds],
  );
  const hasRounds = availableRounds.length > 0;
  const onCreateApplication = useCallback(async () => {
    if (!selectedRound) {
      return;
    }
    try {
      await createRoundCampaign({
        roundId: selectedRound.id,
        campaignId: campaign.id,
        applicationReason,
      });
      toast({
        title: 'Application Submitted',
        description: `Campaign "${campaign.title}" has been applied to "${selectedRound.title}".`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Application Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to submit application.',
        variant: 'destructive',
      });
    }
  }, [
    createRoundCampaign,
    selectedRound,
    campaign,
    onClose,
    applicationReason,
    toast,
  ]);
  const onAdd = useCallback(async () => {
    if (isAdmin) {
      await onCreateApplication();
      return;
    }
    setPage(1);
  }, [isAdmin, onCreateApplication]);
  const onApplicationReasonChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      setApplicationReason(event.target.value),
    [],
  );
  const currentlyAppliedMessage = useMemo(() => {
    return (
      campaign.rounds &&
      campaign.rounds.length > 0 &&
      `Currently applied to ${campaign.rounds.length} ${campaign.rounds.length === 1 ? 'Round' : 'Rounds'}`
    );
  }, [campaign]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {isAdmin
                ? 'Add Campaign to Round'
                : 'Apply your Campaign to Round'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-1 md:py-4">
          {page === 0 && (
            <>
              {isRoundsDataPending ? (
                <p className="mb-1 text-sm text-gray-600 md:mb-4">
                  Loading available rounds
                </p>
              ) : !hasRounds ? (
                <div className="space-y-4 py-8 text-center">
                  <p className="text-muted-foreground">
                    No more rounds to add.
                  </p>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentlyAppliedMessage && (
                    <p className="text-sm text-muted-foreground">
                      {currentlyAppliedMessage}
                    </p>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Round</label>
                    <Select
                      value={selectedRound?.id?.toString() || ''}
                      onValueChange={onRoundSelected}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a round to apply to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRounds.map(
                          (round: GetRoundResponseInstance) => (
                            <SelectItem
                              key={round.id}
                              value={round.id.toString()}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {round.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Deadline:{' '}
                                  {new Date(
                                    round.applicationEndTime,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
          {page === 1 && typeof selectedRound !== 'undefined' && (
            <>
              <p className="pb-2">
                Describe why your campaign{' '}
                <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                  <b>{campaign.title}</b>
                </Link>{' '}
                should be approved for the round{' '}
                <Link href={`/rounds/${selectedRound.id}`} target="_blank">
                  <b>{selectedRound.title}</b>
                </Link>
              </p>
              <Textarea
                placeholder="Application Text"
                onChange={onApplicationReasonChanged}
              />
            </>
          )}

          <div className="mt-6 flex gap-4">
            {page === 0 && hasRounds && (
              <>
                <Button disabled={!canAdd} onClick={onAdd}>
                  {isAdmin ? 'Add' : 'Apply Now'}
                </Button>
              </>
            )}
            {page === 1 && hasRounds && (
              <Button
                disabled={!canAdd || isPending}
                onClick={onCreateApplication}
              >
                {isPending ? 'Saving...' : 'Send Application'}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
