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
export function CampaignInfoDialog({
  campaign,
  children,
}: {
  campaign?: DbCampaign;
  children?: React.ReactNode;
}) {
  const { amountRaised, amountGoal } = useCampaignStatsFromInstance({
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
      <DialogContent>
        <DialogTitle>Info</DialogTitle>
        <Table>
          <TableBody>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableCell>
                <ContractLink
                  address={campaign.campaignAddress}
                  chainConfig={chainConfig}
                >
                  {campaign.campaignAddress ?? 'No Address'}
                </ContractLink>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableCell>
                <UserInlineName user={campaign.creator} />{' '}
                {campaign.creatorAddress}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Launch Time</TableHead>
              <TableCell>
                <FormattedDate date={campaign.startTime} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Deadline</TableHead>
              <TableCell>
                <FormattedDate date={campaign.endTime} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Goal Amount</TableHead>
              <TableCell>{amountGoal}</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Total Raised</TableHead>
              <TableCell>{amountRaised}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
