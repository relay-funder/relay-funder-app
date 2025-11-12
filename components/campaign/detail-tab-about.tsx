import { type DbCampaign } from '@/types/campaign';
import { ReadMoreOrLess } from '@/components/read-more-or-less';
import type { TabNames } from './detail-tabs';
import { Button } from '@/components/ui';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';

export function CampaignDetailTabAbout({
  campaign,
  activeTab,
  onActiveTabChanged,
}: {
  campaign: DbCampaign;
  activeTab: TabNames;
  onActiveTabChanged?: (tabName: TabNames) => void;
}) {
  const { authenticated } = useAuth();
  const onComment = useCallback(() => {
    onActiveTabChanged?.('comments');
  }, [onActiveTabChanged]);
  const isComment = useMemo(() => activeTab === 'comments', [activeTab]);

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground">
        About this campaign
      </h2>

      <div className="max-w-none">
        <ReadMoreOrLess
          className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
          collapsedClassName="line-clamp-2"
        >
          {campaign.description}
        </ReadMoreOrLess>
      </div>
      {authenticated && (
        <Button
          className={cn('mt-2', isComment && 'pointer-events-none invisible')}
          onClick={onComment}
          aria-hidden={isComment}
          tabIndex={isComment ? -1 : undefined}
        >
          Comment
        </Button>
      )}
    </div>
  );
}
