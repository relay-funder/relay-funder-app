import { GetRoundResponseInstance } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ReadMoreOrLess } from '../read-more-or-less';

export function RoundCardTabOverview({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About this Round</CardTitle>
      </CardHeader>
      <CardContent>
        <ReadMoreOrLess>{round.description}</ReadMoreOrLess>
      </CardContent>
    </Card>
  );
}
