'use client';
import { useInView } from 'react-intersection-observer';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/components/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useCreateRoundCampaign,
  useInfiniteRounds,
} from '@/lib/hooks/useRounds';
import { DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';
import { RoundCardSelect } from '@/components/round/card-select';
import { GetRoundResponseInstance } from '@/lib/api/types';
import Link from 'next/link';

export function CampaignAddRoundDialog({
  campaign,
  onClosed,
}: {
  campaign: DbCampaign;
  onClosed?: () => void;
}) {
  const { ref, inView } = useInView();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [applicationReason, setApplicationReason] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<
    GetRoundResponseInstance | undefined
  >();
  const {
    data: roundsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isRoundsDataPending,
  } = useInfiniteRounds(10);

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
  const onRoundSelected = useCallback(
    async (round: GetRoundResponseInstance) => {
      setSelectedRound(round);
    },
    [setSelectedRound],
  );
  const rounds = useMemo(() => {
    if (roundsData) {
      const now = new Date();
      return roundsData.pages.reduce((accumulator, page) => {
        return accumulator.concat(
          page.rounds.filter((round) => {
            if (new Date(round.applicationEndTime) < now) {
              return false;
            }
            if (
              campaign.rounds?.find((campaignRound) => {
                return campaignRound.id === round.id;
              })
            ) {
              return false;
            }
            return true;
          }),
        );
      }, [] as GetRoundResponseInstance[]);
    }
    return [] as GetRoundResponseInstance[];
  }, [roundsData, campaign]);
  const hasRounds = rounds.length > 0;
  const onCreateApplication = useCallback(async () => {
    if (!selectedRound) {
      return;
    }
    await createRoundCampaign({
      roundId: selectedRound.id,
      campaignId: campaign.id,
      applicationReason,
    });
    onClose();
  }, [
    createRoundCampaign,
    selectedRound,
    campaign,
    onClose,
    applicationReason,
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
      campaign.rounds?.length &&
      `Currently applied to ${campaign.rounds.length} ${campaign.rounds.length === 1 ? 'Round' : 'Rounds'}`
    );
  }, [campaign]);
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                <p className="mb-1 text-sm text-gray-600 md:mb-4">
                  There are no rounds to apply to. {currentlyAppliedMessage}
                </p>
              ) : (
                <>
                  <p className="mb-4 text-sm text-gray-600">
                    {currentlyAppliedMessage}. Choose the round you want to
                    apply for.
                  </p>

                  <div className="max-h-[60vh] space-y-2 overflow-y-auto md:max-h-[75vh]">
                    {rounds.map((round) => (
                      <div
                        key={round.id}
                        className={cn(
                          'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-green-50',
                          selectedRound?.id === round.id &&
                            'border-emerald-400 bg-green-50',
                        )}
                        onClick={() => onRoundSelected(round)}
                      >
                        <RoundCardSelect
                          key={round.id}
                          round={round}
                          onSelect={onRoundSelected}
                          disabled={selectedRound?.id === round.id}
                        />
                      </div>
                    ))}
                    {/* Intersection observer target */}
                    <div ref={ref} className="h-10" />
                  </div>
                </>
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
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!canAdd}
                  onClick={onAdd}
                >
                  {isAdmin ? 'Add' : 'Apply Now'}
                </Button>
              </>
            )}
            {page === 1 && hasRounds && (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
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
