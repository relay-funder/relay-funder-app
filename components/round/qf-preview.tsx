'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Download,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { formatUSD } from '@/lib/format-usd';
import { useAdminQfRoundCalculation } from '@/lib/hooks/useAdminQfRoundCalculation';
import { downloadQfDistributionCsv } from '@/lib/qf';

interface RoundQfPreviewProps {
  round: GetRoundResponseInstance;
  isAdmin: boolean;
}

export function RoundQfPreview({ round, isAdmin }: RoundQfPreviewProps) {
  const {
    data: qfData,
    isPending,
    isError,
    error,
  } = useAdminQfRoundCalculation({
    roundId: round.id,
    enabled: isAdmin && round.matchingPool > 0,
  });

  const { nContributions, nUniqueContributors } = useMemo(() => {
    if (!qfData?.distribution)
      return { nContributions: 0, nUniqueContributors: 0 };
    return qfData.distribution.reduce(
      (sum, item) => ({
        nContributions: sum.nContributions + item.nContributions,
        nUniqueContributors: sum.nUniqueContributors + item.nUniqueContributors,
      }),
      { nContributions: 0, nUniqueContributors: 0 },
    );
  }, [qfData?.distribution]);

  // Don't show if not admin or no matching pool
  if (!isAdmin || round.matchingPool <= 0) {
    return null;
  }

  if (isPending) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Distribution Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">
              Calculating distribution...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <BarChart3 className="h-5 w-5" />
            Distribution Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Unable to load distribution data.
            {(error as Error)?.message ?? 'Please try again later.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qfData || !qfData.distribution || qfData.distribution.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Distribution Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No distribution data available yet. Distribution will appear once
            campaigns receive contributions.
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAllocated = parseFloat(qfData.totalAllocated);

  const handleExportCsv = () => {
    if (qfData) {
      downloadQfDistributionCsv(qfData, {
        filename: `qf-distribution-round-${round.id}.csv`,
        includeTotal: true,
      });
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribution Preview
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={
              !qfData ||
              !qfData.distribution ||
              qfData.distribution.length === 0
            }
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Total Allocated
            </div>
            <div className="font-semibold">{formatUSD(totalAllocated)}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              Contributors
            </div>
            <div className="font-semibold">{nUniqueContributors}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Contributions
            </div>
            <div className="font-semibold">{nContributions}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              Campaigns
            </div>
            <div className="font-semibold">{qfData.distribution.length}</div>
          </div>
        </div>

        {/* Distribution Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Campaign Distribution</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Contributors</TableHead>
                  <TableHead className="text-right">Contributions</TableHead>
                  <TableHead className="text-right">Matching Amount</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qfData.distribution
                  .sort(
                    (a, b) =>
                      parseFloat(b.matchingAmount) -
                      parseFloat(a.matchingAmount),
                  )
                  .map((item) => {
                    const share =
                      totalAllocated > 0
                        ? (parseFloat(item.matchingAmount) / totalAllocated) *
                          100
                        : 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground">
                          {item.id}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {item.title}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.nUniqueContributors}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.nContributions}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatUSD(parseFloat(item.matchingAmount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{share.toFixed(1)}%</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Info Note */}
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            This is a live preview of the quadratic funding distribution based
            on current contributions. Final amounts may change as more
            contributions are made during the round.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
