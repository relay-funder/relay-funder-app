import { type DbCampaign } from '@/types/campaign';
import { ReadMoreOrLess } from '@/components/read-more-or-less';

export function CampaignDetailTabAbout({ campaign }: { campaign: DbCampaign }) {
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
    </div>
  );
}
