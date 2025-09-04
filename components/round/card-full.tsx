import Link from 'next/link';
import { Clock, Calendar, Users, DollarSign, Info } from 'lucide-react';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '../formatted-date';
import { useCallback, useMemo, useState } from 'react';
import { useRoundStatus } from './use-status';
import { useRoundTimeInfo } from './use-time-info';
import {
  Tabs,
  TabsContent,
  TabsList,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Badge,
  TabsTrigger,
  CardTitle,
  CardDescription,
} from '@/components/ui';
import { useAuth } from '@/contexts';
import {
  useRemoveRoundCampaign,
  useUpdateRoundCampaign,
} from '@/lib/hooks/useRounds';
import { RoundAddDialog } from './add-dialog';

export function RoundCardFull({ round }: { round: GetRoundResponseInstance }) {
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);
  const { mutateAsync: updateRoundCampaign, isPending: isUpdatePending } =
    useUpdateRoundCampaign();
  const { mutateAsync: removeRoundCampaign, isPending: isRemovePending } =
    useRemoveRoundCampaign();
  const { isAdmin, address } = useAuth();
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const roundCampaigns = useMemo(() => {
    return (
      round.roundCampaigns?.filter((roundCampaign) => {
        if (isAdmin) {
          return true;
        }
        if (roundCampaign.status === 'APPROVED') {
          return true;
        }
        return false;
      }) ?? []
    );
  }, [round, isAdmin]);
  const numberOfCampaigns = useMemo(() => {
    return roundCampaigns.length;
  }, [roundCampaigns]);
  const onAddCampaign = useCallback(() => {
    setAddCampaignOpen(true);
  }, []);

  const onApproveRoundCampaign = useCallback(
    async (roundCampaign: { campaignId: number; roundId: number }) => {
      await updateRoundCampaign({
        roundId: roundCampaign.roundId,
        campaignId: roundCampaign.campaignId,
        status: 'APPROVED',
      });
    },
    [updateRoundCampaign],
  );
  const onRejectRoundCampaign = useCallback(
    async (roundCampaign: { campaignId: number; roundId: number }) => {
      await updateRoundCampaign({
        roundId: roundCampaign.roundId,
        campaignId: roundCampaign.campaignId,
        status: 'REJECTED',
      });
    },
    [updateRoundCampaign],
  );
  const onRemoveRoundCampaign = useCallback(
    async (roundCampaign: { campaignId: number; roundId: number }) => {
      await removeRoundCampaign({
        roundId: roundCampaign.roundId,
        campaignId: roundCampaign.campaignId,
      });
    },
    [removeRoundCampaign],
  );

  if (!round || !round.id) {
    return (
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border p-4 shadow-sm">
        <p className="text-destructive">Error: Invalid round data.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="border-b p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border">
              {round.logoUrl ? (
                <AvatarImage
                  src={round.logoUrl}
                  alt={`${round.title} logo`}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {round.title ? round.title.charAt(0).toUpperCase() : 'R'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-lg font-semibold leading-tight tracking-tight">
                  {round.title ?? 'Untitled Round'}
                </h2>
                <Badge variant={status.variant} className="shrink-0 text-xs">
                  {status.text}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {round.description ?? 'No description.'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-3 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Matching Pool</span>
            </div>
            <span className="font-medium text-foreground">
              ${round.matchingPool.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Campaigns</span>
            </div>
            <span className="font-medium text-foreground">
              {numberOfCampaigns !== undefined
                ? numberOfCampaigns?.toString()
                : '0'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Timeline</span>
            </div>
            <span className="font-medium text-foreground">
              <FormattedDate date={new Date(round.startTime)} /> -{' '}
              <FormattedDate date={new Date(round.endTime)} />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Application Timeline</span>
            </div>
            <span className="font-medium text-foreground">
              <FormattedDate date={new Date(round.applicationStartTime)} /> -{' '}
              <FormattedDate date={new Date(round.applicationEndTime)} />
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Status</span>
            </div>
            <span className="font-medium text-foreground">{timeInfo}</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-4 pt-0">
          <div className="w-full">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this Round</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{round.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eligibility Criteria</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Project Requirements</h4>
                        <p className="text-sm text-muted-foreground">
                          Your campaign must be open source and align with the
                          round&apos;s goals. Specific requirements may apply.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Team Requirements</h4>
                        <p className="text-sm text-muted-foreground">
                          Teams should demonstrate capability and commitment to
                          their campaign.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campaigns" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Participating Campaigns</CardTitle>
                    <CardDescription>
                      Campaigns approved to participate in this funding round.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {numberOfCampaigns > 0 ? (
                      <div className="space-y-3">
                        {roundCampaigns.map((roundCampaign) => (
                          <>
                            <Link
                              key={roundCampaign.campaign.id}
                              href={`/campaigns/${roundCampaign.campaign.slug ?? roundCampaign.campaign.id}`}
                              target="_blank"
                              className="block rounded-lg border p-4 transition-colors hover:bg-muted"
                            >
                              <h4 className="font-medium">
                                {roundCampaign.campaign.title}
                              </h4>
                              <h4 className="font-medium">
                                {roundCampaign.status}
                              </h4>
                            </Link>
                            {isAdmin && roundCampaign.status === 'PENDING' && (
                              <>
                                <Button
                                  onClick={() =>
                                    onApproveRoundCampaign(roundCampaign)
                                  }
                                  disabled={isUpdatePending}
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() =>
                                    onRejectRoundCampaign(roundCampaign)
                                  }
                                  disabled={isUpdatePending}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(isAdmin ||
                              (roundCampaign.status !== 'APPROVED' &&
                                roundCampaign.campaign.creatorAddress ===
                                  address)) && (
                              <Button
                                onClick={() =>
                                  onRemoveRoundCampaign(roundCampaign)
                                }
                                disabled={isRemovePending}
                              >
                                Remove
                              </Button>
                            )}
                          </>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No campaigns have been approved for this round yet.
                      </p>
                    )}
                    <Button className="w-full" onClick={onAddCampaign}>
                      Add Campaign
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Round Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-medium">Matching Formula</h4>
                      <p className="text-sm text-muted-foreground">
                        This round utilizes a specific matching algorithm (e.g.,
                        Quadratic Funding) to allocate pool funds based on
                        community contributions.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Distribution Schedule</h4>
                      <p className="text-sm text-muted-foreground">
                        Matched funds are typically distributed to campaigns
                        within a set timeframe following the round&apos;s
                        conclusion.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardFooter>
      </Card>
      {addCampaignOpen && (
        <RoundAddDialog
          round={round}
          onClosed={() => setAddCampaignOpen(false)}
        />
      )}
    </>
  );
}
