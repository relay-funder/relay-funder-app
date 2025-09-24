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
import { useCreateRoundCampaign } from '@/lib/hooks/useRounds';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { DbCampaign } from '@/types/campaign';
import {
  useInfiniteCampaigns,
  useInfiniteUserCampaigns,
} from '@/lib/hooks/useCampaigns';
import { useAuth } from '@/contexts';
import { CampaignCard } from '../../campaign/campaign-card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function RoundAddDialog({
  round,
  onClosed,
}: {
  round: GetRoundResponseInstance;
  onClosed?: () => void;
}) {
  const { ref, inView } = useInView();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [applicationReason, setApplicationReason] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<
    DbCampaign | undefined
  >();

  const {
    data: campaignData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isCampaignsDataPending,
  } = useInfiniteCampaigns('all', 10, false);
  const {
    data: userCampaignData,
    fetchNextPage: userFetchNextPage,
    hasNextPage: userHasNextPage,
    isFetchingNextPage: userIsFetchingNextPage,
    isPending: isUserCampaignsDataPending,
  } = useInfiniteUserCampaigns('all', 10, false);

  const canAdd = useMemo(() => {
    if (
      isCampaignsDataPending ||
      isUserCampaignsDataPending ||
      !selectedCampaign
    ) {
      return false;
    }
    if (page === 1 && applicationReason.trim() === '') {
      return false;
    }
    if (
      round.roundCampaigns?.find((roundCampaign) => {
        return roundCampaign.campaignId === selectedCampaign.id;
      })
    ) {
      return false;
    }
    return typeof selectedCampaign !== 'undefined';
  }, [
    selectedCampaign,
    round,
    page,
    applicationReason,
    isCampaignsDataPending,
    isUserCampaignsDataPending,
  ]);
  const { mutateAsync: createRoundCampaign, isPending } =
    useCreateRoundCampaign();
  const onClose = useCallback(() => {
    setSelectedCampaign(undefined);
    typeof onClosed === 'function' && onClosed();
  }, [onClosed]);
  const onCampaignSelected = useCallback(
    async (campaign: DbCampaign) => {
      setSelectedCampaign(campaign);
    },
    [setSelectedCampaign],
  );
  const campaignFilter = useCallback(
    (campaign: DbCampaign) => {
      if (
        round.roundCampaigns?.find(
          (roundCampaign) => campaign.id === roundCampaign.campaignId,
        )
      ) {
        // hide campaigns that are already applied to the round
        return false;
      }
      return true;
    },
    [round],
  );
  const campaignPagesReducer = useCallback(
    (accumulator: DbCampaign[], page: { campaigns: DbCampaign[] }) => {
      return accumulator.concat(page.campaigns.filter(campaignFilter));
    },
    [campaignFilter],
  );
  const userCampaigns = useMemo(() => {
    if (isAdmin && campaignData) {
      return campaignData.pages.reduce(
        campaignPagesReducer,
        [] as DbCampaign[],
      );
    }
    if (!isAdmin && userCampaignData) {
      return userCampaignData.pages.reduce(
        campaignPagesReducer,
        [] as DbCampaign[],
      );
    }
    return [] as DbCampaign[];
  }, [campaignData, userCampaignData, isAdmin, campaignPagesReducer]);
  const hasCampaigns = useMemo(() => {
    if (isAdmin) {
      return true;
    }
    if (!userCampaignData) {
      return false;
    }
    return userCampaigns.length > 0;
  }, [userCampaignData, userCampaigns, isAdmin]);
  const hasApplicableCampaigns = userCampaigns.length > 0;
  const onCreateApplication = useCallback(async () => {
    if (typeof selectedCampaign === 'undefined') {
      return;
    }
    await createRoundCampaign({
      roundId: round.id,
      campaignId: selectedCampaign.id,
      applicationReason,
    });
    onClose();
  }, [
    createRoundCampaign,
    selectedCampaign,
    round,
    onClose,
    applicationReason,
  ]);
  const onAdd = useCallback(async () => {
    if (isAdmin) {
      await onCreateApplication();
      return;
    }
    setPage(1);
  }, [onCreateApplication, isAdmin]);
  const router = useRouter();
  const onCreateCampaign = useCallback(() => {
    router.push('/campaigns/?create=1');
  }, [router]);
  const onApplicationReasonChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      setApplicationReason(event.target.value),
    [],
  );
  useEffect(() => {
    if (isAdmin) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    } else {
      if (inView && userHasNextPage && !userIsFetchingNextPage) {
        userFetchNextPage();
      }
    }
  }, [
    isAdmin,
    inView,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    userHasNextPage,
    userIsFetchingNextPage,
    userFetchNextPage,
  ]);

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
      <DialogContent
        className={cn(
          page === 0 && hasApplicableCampaigns && 'h-full',
          'max-w-[525px]',
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {isAdmin ? 'Add Campaign to Round' : 'Add your Campaign to Round'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-1 md:py-4">
          {page === 0 && (
            <>
              {isCampaignsDataPending || isUserCampaignsDataPending ? (
                <p className="mb-1 text-sm text-gray-600 md:mb-4">
                  Loading available campaigns
                </p>
              ) : !hasApplicableCampaigns ? (
                <p className="mb-1 text-sm text-gray-600 md:mb-4">
                  {isAdmin
                    ? 'All Campaigns applied to this round already!'
                    : hasCampaigns
                      ? 'All of your Campaigns applied to this round already'
                      : 'You do not have any campaigns, create one!'}
                </p>
              ) : (
                <>
                  <p className="mb-4 text-sm text-gray-600">
                    Choose from the available{' '}
                    {userCampaigns.length === 1 ? 'campaign' : 'campaigns'} you
                    want to apply for this round:
                  </p>

                  <div className="max-h-[60vh] space-y-2 overflow-y-auto md:max-h-[75vh]">
                    {userCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className={cn(
                          'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-green-50',
                          selectedCampaign?.id === campaign.id &&
                            'border-emerald-400 bg-green-50',
                        )}
                        onClick={() => onCampaignSelected(campaign)}
                      >
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          type="round-minimal"
                          round={round}
                          onSelect={onCampaignSelected}
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
          {page === 1 && typeof selectedCampaign !== 'undefined' && (
            <>
              <p className="pb-2">
                Describe why your campaign{' '}
                <Link
                  href={`/campaigns/${selectedCampaign.slug}`}
                  target="_blank"
                >
                  <b>{selectedCampaign.title}</b>
                </Link>{' '}
                should be approved for the round{' '}
                <Link href={`/rounds/${round.id}`} target="_blank">
                  <b>{round.title}</b>
                </Link>
              </p>
              <Textarea
                placeholder="Application Text"
                onChange={onApplicationReasonChanged}
              />
            </>
          )}
          <div className="mt-6 flex gap-4">
            {page === 0 && (
              <>
                {!hasApplicableCampaigns ? (
                  <>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={onCreateCampaign}
                    >
                      {isPending ? 'Saving...' : 'Create Campaign'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!canAdd}
                      onClick={onAdd}
                    >
                      {isPending ? 'Saving...' : isAdmin ? 'Add' : 'Apply Now'}
                    </Button>
                  </>
                )}
              </>
            )}
            {page === 1 && (
              <>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!canAdd || isPending}
                  onClick={onCreateApplication}
                >
                  {isPending ? 'Saving...' : 'Send Application'}
                </Button>
              </>
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
