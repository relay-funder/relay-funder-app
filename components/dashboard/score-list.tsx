'use client';

import { useUserScore } from '@/lib/hooks/useUserScore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
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
  Trophy,
  Users,
  Share2
} from 'lucide-react';

interface ScoreItemProps {
  icon: React.ReactNode;
  title: string;
  points: number;
  action: string;
  pointsColor?: string;
}

function ScoreItem({ icon, title, points, action, pointsColor = "text-green-600" }: ScoreItemProps) {
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
          <div className={`flex items-center gap-1 font-semibold ${pointsColor}`}>
            {points > 0 ? <Plus className="h-4 w-4" /> : points < 0 ? <Minus className="h-4 w-4" /> : null}
            <span>{Math.abs(points)} points</span>
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
      {/* Score Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Score</h2>
              <p className="text-muted-foreground">
                Total: <span className="font-semibold text-primary">{score?.totalScore ?? 0}</span> points
                {score && (
                  <span className="ml-2 text-sm">
                    (Creator: {score.creatorScore} • Donor: {score.receiverScore})
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* As a Donor Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-bio" />
          <h3 className="text-lg font-semibold text-foreground">As a Donor</h3>
        </div>
        <div className="space-y-3">
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-red-500" />}
            title="Making donations"
            points={5}
            action="Each donation you make"
          />
          <ScoreItem
            icon={<MessageCircle className="h-5 w-5 text-blue-500" />}
            title="Commenting on campaigns"
            points={1}
            action="Each comment you leave"
          />
          <ScoreItem
            icon={<UserCheck className="h-5 w-5 text-purple-500" />}
            title="Completing your profile"
            points={2}
            action="One-time bonus for full profile"
          />
        </div>
      </div>

      {/* As a Campaign Creator Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-foreground">As a Campaign Creator</h3>
        </div>
        <div className="space-y-3">
          <ScoreItem
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Campaign approved"
            points={10}
            action="When your campaign gets approved"
          />
          <ScoreItem
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            title="Campaign disabled"
            points={-5}
            action="When your campaign gets disabled"
            pointsColor="text-red-600"
          />
          <ScoreItem
            icon={<MessageCircle className="h-5 w-5 text-blue-500" />}
            title="Comments on your campaign"
            points={1}
            action="Each comment from others"
          />
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-red-500" />}
            title="Donations to your campaign"
            points={1}
            action="Each donation received"
          />
          <ScoreItem
            icon={<Edit className="h-5 w-5 text-orange-500" />}
            title="Updating your campaign"
            points={3}
            action="Each time you update your campaign"
          />
        </div>
      </div>

      {/* Sharing Campaigns Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-foreground">Sharing Campaigns</h3>
        </div>
        <div className="space-y-3">
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-pink-500" />}
            title="User signup via share"
            points={2}
            action="Someone signs up using your share link"
          />
          <ScoreItem
            icon={<Heart className="h-5 w-5 text-pink-500" />}
            title="Donation via share"
            points={5}
            action="Someone donates using your share link"
          />
        </div>
      </div>

      {/* Tip Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Donors can rack up points quickly by making many donations,
            while creators earn significant points for having their campaigns approved and
            keeping them updated with quality content. Engage actively to boost your score!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
