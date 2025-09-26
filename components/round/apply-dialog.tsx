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
import { useCreateRoundCampaign } from '@/lib/hooks/useRounds';
import { useInfiniteUserCampaigns } from '@/lib/hooks/useCampaigns';
import { DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

export function RoundApplyDialog({
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

  const { data: campaignData, isPending: isCampaignDataPending } =
    useInfiniteUserCampaigns('active', 10, true); // Fetch user's campaigns with rounds data (max pageSize is 10)

  const canAdd = useMemo(() => {
    if (isCampaignDataPending || !selectedCampaign) {
      return false;
    }
    if (page === 1 && applicationReason.trim() === '') {
      return false;
    }
    // Check if campaign is already applied to this round
    if (
      selectedCampaign.rounds?.find((campaignRound) => {
        return campaignRound.id === round.id;
      })
    ) {
      return false;
    }
    return typeof selectedCampaign !== 'undefined';
  }, [selectedCampaign, round, isCampaignDataPending, applicationReason, page]);

  const { mutateAsync: createRoundCampaign, isPending } =
    useCreateRoundCampaign();

  const onClose = useCallback(() => {
    setOpen(false);
    typeof onClosed === 'function' && onClosed();
  }, [onClosed]);

  // Get all user's active campaigns (before filtering)
  const allUserCampaigns = useMemo(() => {
    if (campaignData?.pages) {
      const allCampaigns = campaignData.pages.reduce((acc, page) => {
        return acc.concat(page.campaigns);
      }, [] as DbCampaign[]);

      const activeCampaigns = allCampaigns.filter((campaign: DbCampaign) => {
        return campaign.status === 'ACTIVE';
      });

      return activeCampaigns;
    }
    return [] as DbCampaign[];
  }, [campaignData]);

  // Get campaigns that are available to apply (not already applied to this round)
  // Note: Campaigns removed by admin are automatically available for re-addition
  // since the RoundCampaigns relationship is deleted upon removal
  const userCampaigns = useMemo(() => {
    return allUserCampaigns.filter((campaign: DbCampaign) => {
      // Filter out campaigns that are already applied to this round
      // If a campaign was removed by admin, it won't be in campaign.rounds anymore
      return !campaign.rounds?.find((campaignRound) => {
        return campaignRound.id === round.id;
      });
    });
  }, [allUserCampaigns, round]);

  const onCampaignSelected = useCallback(
    (campaignId: string) => {
      const campaign = userCampaigns.find(
        (c: DbCampaign) => c.id.toString() === campaignId,
      );
      setSelectedCampaign(campaign);
    },
    [userCampaigns],
  );

  const hasCampaigns = userCampaigns.length > 0;

  const onCreateApplication = useCallback(async () => {
    if (!selectedCampaign) {
      return;
    }
    try {
      await createRoundCampaign({
        roundId: round.id,
        campaignId: selectedCampaign.id,
        applicationReason,
      });
      toast({
        title: 'Application Submitted',
        description: `Your campaign "${selectedCampaign.title}" has been successfully applied to this round.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Application Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to submit application. Please try again.',
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
  }, [isAdmin, onCreateApplication]);

  const onApplicationReasonChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      setApplicationReason(event.target.value),
    [],
  );

  const currentlyAppliedMessage = useMemo(() => {
    const appliedCount = selectedCampaign?.rounds?.length || 0;
    return (
      appliedCount > 0 &&
      `Currently applied to ${appliedCount} ${appliedCount === 1 ? 'round' : 'rounds'}`
    );
  }, [selectedCampaign]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply Campaign to &quot;{round.title}&quot;</DialogTitle>
        </DialogHeader>

        {page === 0 && (
          <div className="space-y-6">
            {!hasCampaigns ? (
              // No campaigns available to apply
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">
                  No more campaigns to add.
                </p>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              // Campaign selection with dropdown
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Campaign</label>
                  <Select
                    value={selectedCampaign?.id?.toString() || ''}
                    onValueChange={onCampaignSelected}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a campaign to apply..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userCampaigns.map((campaign: DbCampaign) => (
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

                {selectedCampaign && currentlyAppliedMessage && (
                  <p className="text-xs text-muted-foreground">
                    {currentlyAppliedMessage}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={onAdd} disabled={!canAdd || isPending}>
                    {isPending
                      ? 'Applying...'
                      : isAdmin
                        ? 'Apply Campaign'
                        : 'Continue'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-medium">Application Reason</h4>
              <p className="text-sm text-muted-foreground">
                Please explain why your campaign should be included in this
                round:
              </p>
              <Textarea
                placeholder="Explain why your campaign is a good fit for this round..."
                value={applicationReason}
                onChange={onApplicationReasonChanged}
                rows={4}
                className="resize-none"
              />
            </div>

            {selectedCampaign && (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium">Applying Campaign:</h4>
                <p className="text-sm font-semibold">
                  {selectedCampaign.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  to &quot;{round.title}&quot;
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPage(0)}>
                Back
              </Button>
              <Button
                onClick={onCreateApplication}
                disabled={!canAdd || isPending}
              >
                {isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
