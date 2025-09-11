import { GetRoundResponseInstance } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Info } from 'lucide-react';

export function RoundCardTabRules({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const hasMatchingFormula = round.tags.includes('RULE_MATCHING_QF');
  const isDistributionAfter = round.tags.includes('RULE_DISTRIBUTION_AFTER');
  const isDistributionDuring = round.tags.includes('RULE_DISTRIBUTION_DURING');
  const hasDistributionSchedule = isDistributionAfter || isDistributionDuring;
  if (!hasMatchingFormula && !hasDistributionSchedule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Round Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div>
              <h4 className="font-medium">No Round Rules</h4>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Round Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasMatchingFormula && (
          <div className="space-y-1">
            <h4 className="font-medium">Matching Formula</h4>
            <p className="text-sm text-muted-foreground">
              This round utilizes a specific matching algorithm (e.g., Quadratic
              Funding) to allocate pool funds based on community contributions.
            </p>
          </div>
        )}
        {hasDistributionSchedule && (
          <div className="space-y-1">
            <h4 className="font-medium">Distribution Schedule</h4>
            <p className="text-sm text-muted-foreground">
              Matched funds are typically distributed to campaigns within a set
              timeframe following the round&apos;s conclusion.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
