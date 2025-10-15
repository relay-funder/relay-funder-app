'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DbCampaign } from '@/types/campaign';
import { CampaignUpdateForm } from '@/components/campaign/update-form';
import { useInfiniteCampaignUpdates } from '@/lib/hooks/useUpdates';
import { format } from 'date-fns';

interface CampaignUpdateModalProps {
  campaign: DbCampaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignUpdateModal({
  campaign,
  open,
  onOpenChange,
}: CampaignUpdateModalProps) {
  const { data } = useInfiniteCampaignUpdates(campaign.id);

  const updates = data?.pages.flatMap((page) => page.updates) ?? [];
  const latestUpdate = updates.length > 0 ? updates[0] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Update</DialogTitle>
          <DialogDescription>
            Share an update with your campaign supporters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <CampaignUpdateForm
            campaignId={campaign.id}
            creatorAddress={campaign.creatorAddress}
            onSuccess={() => onOpenChange(false)}
          />
          {latestUpdate && (
            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-semibold">Latest Update</h4>
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <h5 className="font-medium">{latestUpdate.title}</h5>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {latestUpdate.content}
                </p>
                {latestUpdate.media && latestUpdate.media.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Includes {latestUpdate.media.length} media item(s)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(latestUpdate.createdAt), 'PPP')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
