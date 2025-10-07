'use client';

import { useUserScore } from '@/lib/hooks/useUserScore';
import { Card, CardContent } from '@/components/ui';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
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
  Share2,
} from 'lucide-react';

interface ScoreItemProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  action: string;
  valueColor?: string;
}

function ScoreItem({
  icon,
  title,
  value,
  action,
  valueColor = 'text-green-600',
}: ScoreItemProps) {
  return (
    <Card className="bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {icon}
            </div>
            <div>
              <h4 className="font-medium text-foreground">{title}</h4>
              <p className="text-sm text-muted-foreground">{action}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 font-semibold ${valueColor}`}
          >
            {value > 0 ? (
              <Plus className="h-4 w-4" />
            ) : value < 0 ? (
              <Minus className="h-4 w-4" />
            ) : null}
            <span>{Math.abs(value)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScoreList() {
  const { data: score, isLoading, error } = useUserScore();

  if (isLoading) {
    return <CampaignLoading minimal={true} />;
  }

  if (error) {
    return <CampaignError error={error.message} />;
  }

  return (
    <div className="space-y-6">
      {/* Karma Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Flower2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Karma</h2>
              <p className="text-muted-foreground">
                Total:{' '}
                <span className="font-semibold text-primary">
                  {score?.totalScore ?? 0} karma
                </span>
                {score && (
                  <span className="ml-2 text-sm">
                    (Creator: {score.creatorScore} • Donor:{' '}
                    {score.receiverScore})
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positive Contributions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-bio" />
          <h3 className="text-lg font-semibold text-foreground">
            Contributions
          </h3>
        </div>
        <div className="space-y-3">
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-red-500" />}
            title="Making donations"
            value={5}
            action="Each donation you make"
          />
          <ScoreItem
            icon={<MessageCircle className="h-5 w-5 text-blue-500" />}
            title="Commenting on campaigns"
            value={1}
            action="Each comment you leave"
          />
          <ScoreItem
            icon={<UserCheck className="h-5 w-5 text-purple-500" />}
            title="Completing your profile"
            value={2}
            action="One-time bonus for full profile"
          />
        </div>
      </div>

      {/* Creating Impact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Creating Humanitarian Impact
          </h3>
        </div>
        <div className="space-y-3">
          <ScoreItem
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Campaign approved"
            value={10}
            action="When your campaign gets approved"
          />
          <ScoreItem
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            title="Campaign disabled"
            value={-5}
            action="When your campaign gets disabled"
            valueColor="text-red-600"
          />
          <ScoreItem
            icon={<MessageCircle className="h-5 w-5 text-blue-500" />}
            title="Comments on your campaign"
            value={1}
            action="Each comment from others"
          />
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-red-500" />}
            title="Donations to your campaign"
            value={1}
            action="Each donation received"
          />
          <ScoreItem
            icon={<Edit className="h-5 w-5 text-orange-500" />}
            title="Updating your campaign"
            value={3}
            action="Each time you update your campaign"
          />
        </div>
      </div>

      {/* Sharing & Outreach Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Sharing & Outreach
          </h3>
        </div>
        <div className="space-y-3">
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-pink-500" />}
            title="User signup via share"
            value={2}
            action="Someone signs up using your share link"
          />
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-pink-500" />}
            title="Donation via share"
            value={5}
            action="Someone donates using your share link"
          />
        </div>
      </div>

      {/* Tip Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Every contribution to our humanitarian
            ecosystem creates positive change. Whether donating to meaningful
            causes, creating impactful campaigns, or sharing opportunities with
            others - your actions matter and help build a better world for
            everyone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
