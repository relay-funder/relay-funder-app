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
import { cn } from '@/lib/utils';
import { useCreateRoundCampaign } from '@/lib/hooks/useRounds';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { DbCampaign } from '@/types/campaign';
import { useInfiniteCampaigns } from '@/lib/hooks/useCampaigns';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function RoundAddDialog({
  round,
  onClosed,
}: {
  round: GetRoundResponseInstance;
  onClosed?: () => void;
}) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [applicationReason, setApplicationReason] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<
    DbCampaign | undefined
  >();

  const { data: campaignData, isPending: isCampaignsDataPending } =
    useInfiniteCampaigns('all', 10); // Use infinite campaigns with proper page size limit

  const canAdd = useMemo(() => {
    if (isCampaignsDataPending || !selectedCampaign) {
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
  ]);
  const { mutateAsync: createRoundCampaign, isPending } =
    useCreateRoundCampaign();
  const onClose = useCallback(() => {
    setSelectedCampaign(undefined);
    typeof onClosed === 'function' && onClosed();
  }, [onClosed]);

  // Use all campaigns for admin (process infinite query structure)
  const allCampaigns = useMemo(() => {
    if (campaignData?.pages) {
      return campaignData.pages.reduce((acc, page) => {
        return acc.concat(page.campaigns);
      }, [] as DbCampaign[]);
    }
    return [] as DbCampaign[];
  }, [campaignData]);

  const onCampaignSelected = useCallback(
    (campaignId: string) => {
      const campaign = allCampaigns.find(
        (c: DbCampaign) => c.id.toString() === campaignId,
      );
      setSelectedCampaign(campaign);
    },
    [allCampaigns],
  );
  // Filter out campaigns that are already applied to this round
  // Note: Campaigns removed by admin are automatically available for re-addition
  // since the RoundCampaigns relationship is deleted upon removal
  const availableCampaigns = useMemo(() => {
    return allCampaigns.filter((campaign: DbCampaign) => {
      return !round.roundCampaigns?.find(
        (roundCampaign) => campaign.id === roundCampaign.campaignId,
      );
    });
  }, [allCampaigns, round]);

  const hasCampaigns = allCampaigns.length > 0;
  const hasApplicableCampaigns = availableCampaigns.length > 0;
  const onCreateApplication = useCallback(async () => {
    if (typeof selectedCampaign === 'undefined') {
      return;
    }
    try {
      await createRoundCampaign({
        roundId: round.id,
        campaignId: selectedCampaign.id,
        applicationReason,
      });
      toast({
        title: 'Campaign Added',
        description: `Campaign "${selectedCampaign.title}" has been added to the round.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to Add Campaign',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while adding the campaign.',
        variant: 'destructive',
      });
    }
  }, [
    createRoundCampaign,
    selectedCampaign,
    round,
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
              {isCampaignsDataPending ? (
                <p className="mb-1 text-sm text-gray-600 md:mb-4">
                  Loading available campaigns
                </p>
              ) : !hasApplicableCampaigns ? (
                <div className="space-y-4 py-8 text-center">
                  <p className="text-muted-foreground">
                    No more campaigns to add.
                  </p>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Campaign
                    </label>
                    <Select
                      value={selectedCampaign?.id?.toString() || ''}
                      onValueChange={onCampaignSelected}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a campaign to add..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCampaigns.map((campaign: DbCampaign) => (
                          <SelectItem
                            key={campaign.id}
                            value={campaign.id.toString()}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {campaign.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {campaign.category} • {campaign.status}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
          {hasApplicableCampaigns && (
            <div className="mt-6 flex gap-4">
              {page === 0 && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!canAdd}
                  onClick={onAdd}
                >
                  {isPending ? 'Saving...' : isAdmin ? 'Add' : 'Apply Now'}
                </Button>
              )}
              {page === 1 && (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
