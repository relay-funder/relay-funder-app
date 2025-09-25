import { DbCampaign } from '@/types/campaign';
import { MapPin } from 'lucide-react';

export function CampaignLocation({ campaign }: { campaign?: DbCampaign }) {
  return (
    <div className="align flex self-start">
      <MapPin className="mr-1 text-[#55DFAB]" />
      <span className="text-sm text-gray-900 ">
        {campaign?.location ?? 'Earth'}
      </span>
    </div>
  );
}
