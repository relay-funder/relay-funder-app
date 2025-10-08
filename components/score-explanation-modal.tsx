'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Heart,
  MessageCircle,
  UserCheck,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Minus,
  Flower2,
} from 'lucide-react';
import { CREATOR_EVENT_POINTS, RECEIVER_EVENT_POINTS } from '@/lib/constant';

interface ScoreExplanationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScoreExplanationModal({
  open,
  onOpenChange,
}: ScoreExplanationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-primary" />
            How Karma Points Work
          </DialogTitle>
          <DialogDescription>
            Your karma score reflects your engagement and contributions to the
            platform. Points are earned through various activities as both a
            donor and campaign creator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5 text-red-500" />
              As a Donor
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Making donations</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{CREATOR_EVENT_POINTS.CampaignPayment} points</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span>Commenting on campaigns</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{CREATOR_EVENT_POINTS.CampaignComment} point{CREATOR_EVENT_POINTS.CampaignComment === 1 ? '' : 's'}</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-500" />
                  <span>Completing your profile</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{CREATOR_EVENT_POINTS.ProfileCompleted} points</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-5 w-5 text-green-500" />
              As a Campaign Creator
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Your campaign gets approved</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{RECEIVER_EVENT_POINTS.CampaignApprove} points</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Your campaign gets disabled</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-red-600">
                  <Minus className="h-4 w-4" />
                  <span>{Math.abs(RECEIVER_EVENT_POINTS.CampaignDisable)} points</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span>Someone comments on your campaign</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{RECEIVER_EVENT_POINTS.CampaignComment} point{RECEIVER_EVENT_POINTS.CampaignComment === 1 ? '' : 's'}</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Someone donates to your campaign</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{RECEIVER_EVENT_POINTS.CampaignPayment} point{RECEIVER_EVENT_POINTS.CampaignPayment === 1 ? '' : 's'}</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-orange-500" />
                  <span>Updating your campaign</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{CREATOR_EVENT_POINTS.CampaignUpdate} points</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Flower2 className="h-5 w-5 text-pink-500" />
              Sharing & Outreach
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Someone uses your share link</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>{RECEIVER_EVENT_POINTS.CampaignShare} points</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>💡 Tip:</strong> Karma points reflect your positive impact
              on the platform. Donors earn points quickly through engagement,
              while creators build substantial karma by launching and
              maintaining successful campaigns. Every action contributes to
              building a better world for everyone!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
