import { DbCampaign } from '@/types/campaign';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui';
import { Info } from 'lucide-react';
import { FormattedDate } from '@/components/formatted-date';
import { UserInlineName } from '@/components/user/inline-name';
import ContractLink from '../page/contract-link';
import { chainConfig } from '@/lib/web3';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { TreasuryBalanceCompact } from './treasury-balance';
import { Badge } from '@/components/ui/badge';

export function CampaignInfoDialog({
  campaign,
  children,
}: {
  campaign?: DbCampaign;
  children?: React.ReactNode;
}) {
  const { amountGoal } = useCampaignStatsFromInstance({
    campaign,
  });
  if (!campaign) {
    return null;
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Info className="float-right mr-2 h-4 w-4 cursor-pointer" />
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Campaign Info</DialogTitle>
        <div className="space-y-4">
          {/* Compact Information Table */}
          <Table>
            <TableBody>
              {/* Creator */}
              <TableRow>
                <TableHead className="w-20 text-xs">Creator</TableHead>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    <UserInlineName user={campaign.creator} />
                    <div className="break-all font-mono text-xs text-gray-500">
                      {campaign.creatorAddress}
                    </div>
                  </div>
                </TableCell>
              </TableRow>

              {/* Goal */}
              <TableRow>
                <TableHead className="text-xs">Goal</TableHead>
                <TableCell className="py-2 font-medium">{amountGoal}</TableCell>
              </TableRow>

              {/* Timing */}
              <TableRow>
                <TableHead className="text-xs">Launch</TableHead>
                <TableCell className="py-2 text-sm">
                  <FormattedDate date={campaign.startTime} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="text-xs">Deadline</TableHead>
                <TableCell className="py-2 text-sm">
                  <FormattedDate date={campaign.endTime} />
                </TableCell>
              </TableRow>

              {/* Smart Contracts */}
              <TableRow>
                <TableHead className="text-xs">Campaign</TableHead>
                <TableCell className="py-2">
                  {campaign.campaignAddress ? (
                    <ContractLink
                      address={campaign.campaignAddress}
                      chainConfig={chainConfig}
                    >
                      <span className="break-all font-mono text-xs text-blue-600 hover:text-blue-800">
                        {campaign.campaignAddress}
                      </span>
                    </ContractLink>
                  ) : (
                    <span className="text-xs text-gray-400">Not deployed</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="text-xs">Treasury</TableHead>
                <TableCell className="py-2">
                  {campaign.treasuryAddress ? (
                    <ContractLink
                      address={campaign.treasuryAddress}
                      chainConfig={chainConfig}
                    >
                      <span className="break-all font-mono text-xs text-green-600 hover:text-green-800">
                        {campaign.treasuryAddress}
                      </span>
                    </ContractLink>
                  ) : (
                    <span className="text-xs text-gray-400">Not deployed</span>
                  )}
                </TableCell>
              </TableRow>

              {/* Campaign Status */}
              <TableRow>
                <TableHead className="text-xs">Status</TableHead>
                <TableCell className="py-2">
                  <Badge
                    variant={
                      campaign.status === 'ACTIVE'
                        ? 'default'
                        : campaign.status === 'PENDING_APPROVAL'
                          ? 'secondary'
                          : campaign.status === 'COMPLETED'
                            ? 'outline'
                            : 'destructive'
                    }
                    className="text-xs"
                  >
                    {campaign.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>

              {/* Creation Date */}
              <TableRow>
                <TableHead className="text-xs">Created</TableHead>
                <TableCell className="py-2 text-sm">
                  <FormattedDate date={campaign.createdAt} />
                </TableCell>
              </TableRow>

              {/* Location */}
              {campaign.location && (
                <TableRow>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableCell className="py-2 text-sm">
                    {campaign.location}
                  </TableCell>
                </TableRow>
              )}

              {/* Category */}
              {campaign.category && (
                <TableRow>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableCell className="py-2 text-sm">
                    {campaign.category}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Treasury Balance Section */}
          {campaign.treasuryAddress && (
            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-medium">Treasury Balance</h3>
              <TreasuryBalanceCompact
                treasuryAddress={campaign.treasuryAddress}
                className="text-xs"
              />
            </div>
          )}

          {/* Round Applications */}
          {campaign.rounds && campaign.rounds.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-medium">Round Applications</h3>
              <div className="space-y-1">
                {campaign.rounds.map((round) => (
                  <div
                    key={round.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{round.title}</span>
                    {round.recipientStatus && (
                      <Badge
                        variant={
                          round.recipientStatus === 'APPROVED'
                            ? 'default'
                            : round.recipientStatus === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="ml-2 text-xs"
                      >
                        {round.recipientStatus.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
