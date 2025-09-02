import { type DbCampaign } from '@/types/campaign';

export function CampaignDetailTabAbout({ campaign }: { campaign: DbCampaign }) {
  return (
    <div className="max-w-3xl">
      <div className="prose prose-lg">
        <h2 className="mb-4 text-2xl font-semibold">About this project</h2>
        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
          {campaign.description}
        </p>
      </div>
    </div>
  );
}
