'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { formatUSD } from '@/lib/format-usd';
import type { ResultReport } from '@/lib/qf/result-report';

export type DistributionPreviewTableProps = {
  campaigns: ResultReport['campaigns'];
};

/**
 * A presentational component that renders the distribution preview table
 * for a given set of campaign results.
 */
export function DistributionPreviewTable({
  campaigns,
}: DistributionPreviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead className="text-right">Suggested</TableHead>
          <TableHead className="text-right">Share %</TableHead>
          <TableHead className="text-right">Payout</TableHead>
          <TableHead className="text-right">Pool %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((c, idx) => (
          <TableRow key={`${c.campaignId}-${idx}`}>
            <TableCell className="max-w-[280px] truncate">
              {c.campaignTitle ?? `#${c.campaignId}`}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {c.recipientAddress ?? '—'}
            </TableCell>
            <TableCell className="text-right">
              {formatUSD(c.suggestedMatch)}
            </TableCell>
            <TableCell className="text-right">
              {c.suggestedSharePct.toFixed(2)}%
            </TableCell>
            <TableCell className="text-right">
              {formatUSD(c.payoutScaled)}
            </TableCell>
            <TableCell className="text-right">
              {c.payoutSharePct.toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DistributionPreviewTable;
