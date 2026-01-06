'use client';

import { GetRoundResponseInstance } from '@/lib/api/types';
import { RoundBasicInfoEditDialog } from './inline-edit/round-basic-info-edit-dialog';
import { RoundVisibilityToggle } from './inline-edit/round-visibility-toggle';

export function RoundAdminInlineEdit({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  return (
    <div className="flex gap-2">
      <RoundBasicInfoEditDialog round={round} />
      <RoundVisibilityToggle roundId={round.id} isHidden={round.isHidden} />
    </div>
  );
}
