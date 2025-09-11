'use client';
import { useInView } from 'react-intersection-observer';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const {
    data: campaignData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCampaigns('all', 10, false);
  const {
    data: userCampaignData,
    fetchNextPage: userFetchNextPage,
    hasNextPage: userHasNextPage,
    isFetchingNextPage: userIsFetchingNextPage,
  } = useInfiniteUserCampaigns('all', 10, false);

  const canAdd = useMemo(() => {
    console.log({ round });
    if (
      round.roundCampaigns?.find((roundCampaign) => {
        return roundCampaign.campaignId === selectedCampaignId;
      })
    ) {
      return false;
    }
    return selectedCampaignId !== null;
  }, [selectedCampaignId, round]);
  const { mutateAsync: createRoundCampaign, isPending } =
    useCreateRoundCampaign();
  const onClose = useCallback(() => {
    setSelectedCampaignId(null);
    typeof onClosed === 'function' && onClosed();
  }, [onClosed]);
  const userCampaigns = useMemo(() => {
    if (isAdmin && campaignData) {
      return campaignData.pages.reduce((accumulator, page) => {
        return accumulator.concat(page.campaigns);
      }, [] as DbCampaign[]);
    }
    if (!isAdmin && userCampaignData) {
      return userCampaignData.pages.reduce((accumulator, page) => {
        return accumulator.concat(page.campaigns);
      }, [] as DbCampaign[]);
    }
    return [] as DbCampaign[];
  }, [campaignData, userCampaignData, isAdmin]);
  const hasCampaigns = userCampaigns.length > 0;
  const onAdd = useCallback(async () => {
    if (selectedCampaignId === null) {
      return;
    }
    await createRoundCampaign({
      roundId: round.id,
      campaignId: selectedCampaignId,
    });
    onClose();
  }, [createRoundCampaign, selectedCampaignId, round, onClose]);
  const onCreateCampaign = useCallback(() => {}, []);
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {isAdmin ? 'Add Campaign to Round' : 'Add your Campaign to Round'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!hasCampaigns ? (
            <p className="mb-4 text-sm text-gray-600">
              You do not have any campaigns, create one!
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                Choose the campaign you want to apply for this round:
              </p>

              <div className="max-h-[40vh] space-y-2 overflow-y-auto">
                {userCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={cn(
                      'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-green-50',
                      selectedCampaignId === campaign.id &&
                        'border-emerald-400 bg-green-50',
                    )}
                    onClick={() => setSelectedCampaignId(campaign.id)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-lg">
                      {campaign.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-grow">{campaign.title}</span>
                    <div
                      className={cn(
                        'h-6 w-6 rounded-full border-2',
                        selectedCampaignId === campaign.id
                          ? 'border-emerald-400 bg-emerald-400'
                          : 'border-gray-200',
                      )}
                    />
                  </div>
                ))}
                {/* Intersection observer target */}
                <div ref={ref} className="h-10" />
              </div>
            </>
          )}

          <div className="mt-6 flex gap-4">
            {!hasCampaigns ? (
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
                  {isPending ? 'Saving...' : 'Add'}
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
