'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
  Label,
} from '@/components/ui';
import { useAuth } from '@/contexts';
import { GetRoundResponseInstance } from '@/lib/api/types';
import {
  useGenerateRoundResults,
  useApproveRoundResults,
  useApprovedRoundResults,
} from '@/lib/hooks/useRoundResults';
import { useRoundStatus } from './use-status';
import { isPast } from 'date-fns';
import DistributionPreviewTable from './distribution-preview-table';
import {
  computeResultReportFromJson,
  computeResultReportFromCsv,
  ResultReport,
  ApprovedResultsLike,
} from '@/lib/qf/result-report';
import { formatUSD } from '@/lib/format-usd';
import { useExecutePayout } from '@/lib/web3/hooks/useExecutePayout';

export function RoundManageResults({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const status = useRoundStatus(round);
  const roundEnded = useMemo(
    () => !!round?.endTime && isPast(new Date(round.endTime)),
    [round],
  );

  const [minHumanityScore, setMinHumanityScore] = useState(50);
  const { executePayout, isExecuting } = useExecutePayout();
  const [strategyAddress, setStrategyAddress] = useState('');

  const { mutateAsync: generateResults, isPending: isGenerating } =
    useGenerateRoundResults();
  const { mutateAsync: approveResults, isPending: isApproving } =
    useApproveRoundResults();
  const {
    data: approvedResult,
    refetch: refetchApproved,
    isFetching: isFetchingApproved,
  } = useApprovedRoundResults(round.id);

  const needsAction = isAdmin && roundEnded && !approvedResult;

  const onDownloadJson = useCallback(async () => {
    const data = await generateResults({
      roundId: round.id,
      minHumanityScore,
      fmt: 'json',
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `round-${round.id}-results.json`;
    a.click();
  }, [generateResults, round.id, minHumanityScore]);

  const onDownloadCsv = useCallback(async () => {
    const data = await generateResults({
      roundId: round.id,
      minHumanityScore,
      fmt: 'csv',
    });
    const blob = new Blob([data as string], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `round-${round.id}-results.csv`;
    a.click();
  }, [generateResults, round.id, minHumanityScore]);

  const onUploadFile = useCallback(
    async (file: File) => {
      await approveResults({ roundId: round.id, file });
      await refetchApproved();
    },
    [approveResults, refetchApproved, round.id],
  );

  const report = useMemo<ResultReport | null>(() => {
    if (!approvedResult) {
      return null;
    }
    try {
      const defaultPool = Number(round.matchingPool || 0);
      if (typeof approvedResult === 'string') {
        return computeResultReportFromCsv(approvedResult, {
          matchingPool: defaultPool,
        });
      }
      const r = approvedResult as ApprovedResultsLike;
      if (r && Array.isArray(r.campaigns)) {
        return computeResultReportFromJson(r, {
          matchingPool: defaultPool,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return null;
  }, [approvedResult, round.matchingPool]);

  const canExecute = !!(report && report.campaigns.length > 0);

  const onExecutePayout = useCallback(async () => {
    if (!canExecute) return;
    if (!strategyAddress || !/^0x[a-fA-F0-9]{40}$/.test(strategyAddress)) {
      alert('Please provide a valid on-chain strategy address (0x...)');
      return;
    }
    try {
      await executePayout({
        strategyAddress,
        campaigns: report?.campaigns ?? [],
      });
      alert('Payout transaction submitted. Please monitor your wallet.');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(`Payout failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [report, canExecute, strategyAddress, executePayout]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-4">
      {needsAction && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">
                Round has ended and requires action
              </div>
              <div className="text-sm text-muted-foreground">
                Generate, review, and approve results to execute payout.
              </div>
            </div>
            <Badge variant="outline">{status.text}</Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label
                htmlFor="min-humanity"
                className="text-sm text-muted-foreground"
              >
                Min Humanity Score
              </Label>
              <Input
                id="min-humanity"
                type="number"
                min={0}
                max={100}
                value={minHumanityScore}
                onChange={(e) =>
                  setMinHumanityScore(parseInt(e.target.value || '0'))
                }
                className="w-40"
              />
            </div>
            <Button onClick={onDownloadJson} disabled={isGenerating}>
              Generate JSON
            </Button>
            <Button
              onClick={onDownloadCsv}
              variant="outline"
              disabled={isGenerating}
            >
              Generate CSV
            </Button>

            <div className="ml-auto">
              <Label
                htmlFor="upload-results"
                className="block text-sm text-muted-foreground"
              >
                Upload Reviewed Results (JSON or CSV)
              </Label>
              <Input
                id="upload-results"
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadFile(f);
                }}
                disabled={isApproving}
              />
            </div>
          </div>

          {isFetchingApproved ? (
            <div className="text-sm text-muted-foreground">
              Loading approved results…
            </div>
          ) : approvedResult ? (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Approved Results Ready.</span>{' '}
                Review the validation and proceed to payout.
              </div>

              {report && (
                <Card className="bg-muted">
                  <CardContent className="grid gap-2 p-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Matching Pool
                      </div>
                      <div className="font-semibold">
                        {formatUSD(report.matchingPool)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Total Donations
                      </div>
                      <div className="font-semibold">
                        {formatUSD(report.totals.totalDonations)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Suggested Match Sum
                      </div>
                      <div className="font-semibold">
                        {formatUSD(report.totals.totalSuggested)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Contributions / Contributors
                      </div>
                      <div className="font-semibold">
                        {report.totals.contributionsCount} /{' '}
                        {report.totals.uniqueContributors}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Distribution Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <DistributionPreviewTable
                    campaigns={report?.campaigns ?? []}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Execute Payout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Provide the on-chain strategy address for this round to set
                    payout amounts on the strategy contract.
                  </div>
                  <Input
                    placeholder="0xStrategyAddress"
                    value={strategyAddress}
                    onChange={(e) => setStrategyAddress(e.target.value)}
                  />
                  <Button
                    disabled={!canExecute || isExecuting}
                    onClick={onExecutePayout}
                  >
                    {isExecuting ? 'Executing…' : 'Execute Payout'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No approved results uploaded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
