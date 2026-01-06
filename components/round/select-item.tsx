import { GetRoundResponseInstance } from '@/lib/api/types';
import { SelectItem } from '@/components/ui';
import { FormattedDate } from '@/components/formatted-date';
import { CheckCircle } from 'lucide-react';

export function RoundSelectItem({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  return (
    <SelectItem value={round.id.toString()}>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
        <div>
          <div className="font-medium">{round.title}</div>
          <div className="text-xs text-muted-foreground">
            <FormattedDate date={new Date(round.startTime)} /> -{' '}
            <FormattedDate date={new Date(round.endTime)} />
          </div>
        </div>
      </div>
    </SelectItem>
  );
}
