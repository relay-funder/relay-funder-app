import { GetRoundResponseInstance } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Info, Users } from 'lucide-react';

export function RoundCardTabCriteria({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const projectRequirementOpenSource = round.tags.includes(
    'REQUIRE_OPEN_SOURCE',
  );
  const teamRequirementCapability = round.tags.includes(
    'REQUIRE_TEAM_CAPABILITY',
  );
  const hasProjectRequirements = projectRequirementOpenSource;
  const hasTeamRequirements = teamRequirementCapability;
  if (!hasProjectRequirements && !hasTeamRequirements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div>
              <h4 className="font-medium">No Requirements</h4>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligibility Criteria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasProjectRequirements && (
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div>
              <h4 className="font-medium">Project Requirements</h4>
              {projectRequirementOpenSource && (
                <p className="text-sm text-muted-foreground">
                  Your campaign must align with the round&apos;s humanitarian 
                  goals and community impact objectives. Specific requirements may apply.
                </p>
              )}
            </div>
          </div>
        )}
        {hasTeamRequirements && (
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div>
              <h4 className="font-medium">Team Requirements</h4>
              <p className="text-sm text-muted-foreground">
                Teams should demonstrate capability and commitment to their
                campaign.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
