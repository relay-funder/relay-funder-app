"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"
// import { applyCampaignToRound } from "@/actions/campaign-actions";
import type { RoundStatusKey } from "@/types/round";

interface ApplyToRoundProps {
  roundId: number;
  roundTitle: string;
  applicationEndDate: Date;
  userCampaigns: { id: string; title: string }[];
  roundStatusKey: RoundStatusKey;
}

const APPLY_ELIGIBLE_STATUSES: RoundStatusKey[] = ["APPLICATION_OPEN"];
const VIEW_ONLY_STATUSES: RoundStatusKey[] = [
  "NOT_STARTED",
  "APPLICATION_CLOSED",
  "ACTIVE",
  "ENDED",
  "UNKNOWN",
];

export function ApplyToRound({
  roundId,
  roundTitle,
  applicationEndDate,
  userCampaigns,
  roundStatusKey,
}: ApplyToRoundProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canApply = APPLY_ELIGIBLE_STATUSES.includes(roundStatusKey);
  const isApplicationPeriodOver = !canApply;

  async function handleApply() {
    if (!selectedCampaignId) {
      toast({
        title: "Please select a campaign to apply.",
        variant: "destructive",
      });
      return;
    }
    if (!canApply) {
      toast({
        title: "Applications for this round are not currently open.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // const result = await applyCampaignToRound({
    //   roundId,
    //   campaignId: parseInt(selectedCampaignId, 10),
    // });
    setIsSubmitting(false);

    // if (result.success) {
    //   toast({
    //     title: `Successfully applied campaign ${userCampaigns.find((c) => c.id === selectedCampaignId)?.title ?? ""
    //       } to round ${roundTitle}.`,
    //     variant: "default",
    //   });
    //   setOpen(false);
    //   setSelectedCampaignId(null);
    // } else {
    //   toast({
    //     title: result?.error ?? "Failed to apply campaign to round.",
    //     variant: "destructive",
    //   });
    // }
  }

  const buttonText = canApply
    ? "Apply Your Project"
    : "View Application Details";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={!canApply && isApplicationPeriodOver}>
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply to {roundTitle}</DialogTitle>
          <DialogDescription>
            {canApply
              ? `Select one of your eligible campaigns to apply to this round. Applications close on ${applicationEndDate.toLocaleDateString()}.`
              : `Applications for this round closed on ${applicationEndDate.toLocaleDateString()}. You can no longer apply.`}
          </DialogDescription>
        </DialogHeader>

        {canApply && userCampaigns.length > 0 && (
          <div className="py-4">
            <Label className="mb-2 block">Your Campaigns</Label>
            <RadioGroup
              value={selectedCampaignId ?? undefined}
              onValueChange={setSelectedCampaignId}
              className="space-y-2"
            >
              {userCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={campaign.id} id={`campaign-${campaign.id}`} />
                  <Label htmlFor={`campaign-${campaign.id}`} className="font-normal">
                    {campaign.title}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {canApply && userCampaigns.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">You don&apos;t have any campaigns eligible to apply. Create a campaign first.</p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {canApply && (
            <Button
              type="button"
              onClick={handleApply}
              disabled={!selectedCampaignId || isSubmitting || !canApply}
            >
              {isSubmitting ? "Applying..." : "Apply Selected Campaign"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
