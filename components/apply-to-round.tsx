"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";
import { applyCampaignToRound } from "@/lib/actions/campaign-actions";
import { usePrivy } from "@privy-io/react-auth";
import type { RoundStatusKey } from "@/types/round";

interface Campaign {
  id: number;
  title: string;
}

interface ApplyToRoundProps {
  roundId: number;
  roundTitle: string;
  applicationEndDate: Date;
  roundStatusKey: RoundStatusKey;
}

const APPLY_ELIGIBLE_STATUSES: RoundStatusKey[] = ["APPLICATION_OPEN"];
// const VIEW_ONLY_STATUSES: RoundStatusKey[] = [
//   "NOT_STARTED",
//   "APPLICATION_CLOSED",
//   "ACTIVE",
//   "ENDED",
//   "UNKNOWN",
// ];

export function ApplyToRound({
  roundId,
  roundTitle,
  applicationEndDate,
  roundStatusKey,
}: ApplyToRoundProps) {
  const { toast } = useToast();
  const { user } = usePrivy();

  const [open, setOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const canApply = APPLY_ELIGIBLE_STATUSES.includes(roundStatusKey);
  const isApplicationPeriodOver = !canApply;

  useEffect(() => {
    async function fetchUserCampaigns() {
      if (!user?.wallet?.address) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/campaigns/user?address=${user.wallet.address}`);
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        
        const data = await response.json();
        setUserCampaigns(data.campaigns || []);
      } catch (error) {
        console.error("Error fetching user campaigns:", error);
        toast({
          title: "Failed to load your campaigns",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchUserCampaigns();
    }
  }, [open, user?.wallet?.address, toast]);

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
    try {
      const result = await applyCampaignToRound({
        roundId,
        campaignId: parseInt(selectedCampaignId, 10),
      });
      
      if (result.success) {
        toast({
          title: `Successfully applied campaign to round ${roundTitle}.`,
          variant: "default",
        });
        setOpen(false);
        setSelectedCampaignId(null);
      } else {
        toast({
          title: result?.error ?? "Failed to apply campaign to round.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying campaign to round:", error);
      toast({
        title: "An error occurred while applying to the round.",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

        {isLoading ? (
          <div className="py-4 text-center">Loading your campaigns...</div>
        ) : canApply && userCampaigns.length > 0 ? (
          <div className="py-4">
            <Label className="mb-2 block">Your Campaigns</Label>
            <RadioGroup
              value={selectedCampaignId ?? undefined}
              onValueChange={setSelectedCampaignId}
              className="space-y-2"
            >
              {userCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(campaign.id)} id={`campaign-${campaign.id}`} />
                  <Label htmlFor={`campaign-${campaign.id}`} className="font-normal">
                    {campaign.title}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : canApply && userCampaigns.length === 0 ? (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">You don&apos;t have any campaigns eligible to apply. Create a campaign first.</p>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link href="/campaigns/create">Create a Campaign</Link>
            </Button>
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {canApply && (
            <Button
              type="button"
              onClick={handleApply}
              disabled={!selectedCampaignId || isSubmitting || !canApply || isLoading}
            >
              {isSubmitting ? "Applying..." : "Apply Selected Campaign"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
