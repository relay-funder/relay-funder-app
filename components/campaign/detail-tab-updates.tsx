'use client';
import { CampaignUpdateForm } from '@/components/campaign/update-form';
import { Timeline } from '@/components/timeline';
import { type DbCampaign } from '@/types/campaign';
import { campaignUpdateFormAction } from './actions/update-form';

export function CampaignDetailTabUpdates({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  return (
    <div className="max-w-3xl space-y-6">
      {campaign.creatorAddress && (
        <CampaignUpdateForm
          creatorAddress={campaign.creatorAddress}
          onSubmit={async (formData) =>
            campaignUpdateFormAction(campaign, formData)
          }
        />
      )}

      {campaign.updates && campaign.updates.length > 0 ? (
        <Timeline
          items={campaign.updates.map((update) => ({
            ...update,
            id: update.id.toString(),
          }))}
          className="w-full"
        />
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            No Updates Yet
          </h3>
          <p className="text-sm text-gray-500">
            Check back later for updates on this campaign&apos;s progress.
          </p>
        </div>
      )}
    </div>
  );
}
