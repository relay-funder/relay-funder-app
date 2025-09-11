import { type DbCampaign } from '@/types/campaign';
import { ReadMoreOrLess } from '@/components/read-more-or-less';

export function CampaignDetailTabAbout({ campaign }: { campaign: DbCampaign }) {
  return (
    <div className="max-w-3xl">
      <div className="prose prose-lg">
        <h2 className="mb-4 text-2xl font-semibold">About this project</h2>
        <ReadMoreOrLess
          className="whitespace-pre-wrap leading-relaxed text-gray-700"
          collapsedClassName="line-clamp-4"
        >
          {campaign.description}
        </ReadMoreOrLess>
      </div>
    </div>
  );
}
