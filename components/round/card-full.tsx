import { Clock, Calendar, Users, DollarSign } from 'lucide-react';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '../formatted-date';
import { useMemo } from 'react';
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
  Badge,
  TabsTrigger,
} from '@/components/ui';
import { RoundCardTabOverview } from './card-full-tab-overview';
import { RoundCardTabCriteria } from './card-full-tab-criteria';
import { RoundCardTabCampaigns } from './card-full-tab-campaigns';
import { RoundCardTabRules } from './card-full-tab-rules';
import { RoundMainImageAvatar } from './main-image-avatar';

export function RoundCardFull({ round }: { round: GetRoundResponseInstance }) {
  const status = useRoundStatus(round);
  const timeInfo = useRoundTimeInfo(round);
  const roundCampaigns = useMemo(() => {
    return round.roundCampaigns ?? [];
  }, [round]);
  const numberOfCampaigns = useMemo(() => {
    return roundCampaigns.length;
  }, [roundCampaigns]);

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
            <RoundMainImageAvatar round={round} />
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="criteria">Criteria</TabsTrigger>
                <TabsTrigger value="campaigns">
                  Campaigns{numberOfCampaigns > 0 && ` (${numberOfCampaigns})`}
                </TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <RoundCardTabOverview round={round} />
              </TabsContent>
              <TabsContent value="criteria" className="mt-6 space-y-6">
                <RoundCardTabCriteria round={round} />
              </TabsContent>

              <TabsContent value="campaigns" className="mt-6">
                <RoundCardTabCampaigns round={round} />
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <RoundCardTabRules round={round} />
              </TabsContent>
            </Tabs>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
