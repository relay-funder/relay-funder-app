import { DbCampaign } from '@/types/campaign';

import {
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Button,
} from '@/components/ui';
import { Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FormattedDate } from '@/components/formatted-date';
import ContractLink from '../page/contract-link';
import { chainConfig } from '@/lib/web3';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { TreasuryBalanceCompact } from './treasury-balance';
import { useAuth } from '@/contexts';

// Utility function to truncate addresses for mobile
function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function CampaignInfoDialog({
  campaign,
  children,
}: {
  campaign?: DbCampaign;
  children?: React.ReactNode;
}) {
  const { address: userAddress, isAdmin } = useAuth();
  const { amountGoal } = useCampaignStatsFromInstance({
    campaign,
  });

  if (!campaign) {
    return null;
  }

  const isOwner = userAddress === campaign.creatorAddress;

  // Filter rounds based on user permissions
  const publicRounds =
    campaign.rounds?.filter((round) => round.recipientStatus === 'APPROVED') ||
    [];
  const pendingRounds =
    campaign.rounds?.filter((round) => round.recipientStatus === 'PENDING') ||
    [];
  const hasRounds =
    publicRounds.length > 0 || (isOwner && pendingRounds.length > 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Info className="float-right mr-2 h-4 w-4 cursor-pointer" />
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto sm:w-full">
        <DialogTitle>Campaign Info</DialogTitle>
        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Creator */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex-shrink-0 text-sm text-muted-foreground">
                    Creator
                  </span>
                  <span className="font-mono text-sm text-foreground">
                    <span className="sm:hidden">
                      {truncateAddress(campaign.creatorAddress)}
                    </span>
                    <span className="hidden sm:inline">
                      {campaign.creatorAddress}
                    </span>
                  </span>
                </div>

                {/* Goal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Goal</span>
                  <span className="text-sm font-medium text-foreground">
                    {amountGoal}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm text-foreground">
                    {campaign.status.replace('_', ' ').toLowerCase()}
                  </span>
                </div>

                {/* Timing */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Launch</span>
                  <span className="text-sm text-foreground">
                    <FormattedDate date={campaign.startTime} />
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Deadline
                  </span>
                  <span className="text-sm text-foreground">
                    <FormattedDate date={campaign.endTime} />
                  </span>
                </div>

                {/* Location */}
                {campaign.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Location
                    </span>
                    <span className="text-sm text-foreground">
                      {campaign.location}
                    </span>
                  </div>
                )}

                {/* Category */}
                {campaign.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Category
                    </span>
                    <span className="text-sm text-foreground">
                      {campaign.category}
                    </span>
                  </div>
                )}

                {/* Created */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm text-foreground">
                    <FormattedDate date={campaign.createdAt} />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Contracts */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-medium text-foreground">
                Smart Contracts
              </h3>
              <div className="space-y-4">
                {/* Campaign Contract */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex-shrink-0 text-sm text-muted-foreground">
                    Campaign
                  </span>
                  <div className="flex items-center gap-2">
                    {campaign.campaignAddress ? (
                      <ContractLink
                        address={campaign.campaignAddress}
                        chainConfig={chainConfig}
                      >
                        <div className="flex items-center gap-2 text-sm text-foreground hover:text-gray-700">
                          <span className="font-mono">
                            <span className="sm:hidden">
                              {truncateAddress(campaign.campaignAddress)}
                            </span>
                            <span className="hidden sm:inline">
                              {campaign.campaignAddress}
                            </span>
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </div>
                      </ContractLink>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Not deployed
                      </span>
                    )}
                  </div>
                </div>

                {/* Treasury Contract */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex-shrink-0 text-sm text-muted-foreground">
                    Treasury
                  </span>
                  <div className="flex items-center gap-2">
                    {campaign.treasuryAddress ? (
                      <ContractLink
                        address={campaign.treasuryAddress}
                        chainConfig={chainConfig}
                      >
                        <div className="flex items-center gap-2 text-sm text-foreground hover:text-gray-700">
                          <span className="font-mono">
                            <span className="sm:hidden">
                              {truncateAddress(campaign.treasuryAddress)}
                            </span>
                            <span className="hidden sm:inline">
                              {campaign.treasuryAddress}
                            </span>
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </div>
                      </ContractLink>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Not deployed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* On-Chain Treasury Balance */}
          {campaign.treasuryAddress && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  On-Chain Treasury Balance
                </h3>
                <TreasuryBalanceCompact
                  treasuryAddress={campaign.treasuryAddress}
                  className="text-sm"
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  Real-time balance from blockchain contract
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rounds */}
          {hasRounds && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  {isOwner ? 'Rounds & Applications' : 'Participating Rounds'}
                </h3>
                <div className="space-y-3">
                  {/* Show approved rounds to everyone */}
                  {publicRounds.map((round) => (
                    <div
                      key={round.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/rounds/${round.id}`}
                        className="truncate text-sm text-foreground hover:text-gray-700 hover:underline"
                      >
                        {round.title}
                      </Link>
                    </div>
                  ))}

                  {/* Show pending applications only to campaign owner */}
                  {isOwner &&
                    pendingRounds.map((round) => (
                      <div
                        key={round.id}
                        className="flex items-center justify-between"
                      >
                        <Link
                          href={`/rounds/${round.id}`}
                          className="truncate text-sm text-foreground hover:text-gray-700 hover:underline"
                        >
                          {round.title}
                        </Link>
                        <span className="ml-3 text-sm text-muted-foreground">
                          pending review
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Admin Links */}
          {isAdmin && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  {'Admin Only Links'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/campaigns/${campaign.id}`}>
                      View Campaign
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/campaigns/${campaign.id}/edit`}>
                      Edit Campaign
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
