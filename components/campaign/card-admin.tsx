import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui';
import { MapPin } from 'lucide-react';
import { type DbCampaign } from '@/types/campaign';
import { FormattedDate } from '@/components/formatted-date';
import { CampaignMainImage } from './main-image';
import { CampaignAdminStatus } from './admin-status';
import { UserInlineName } from '@/components/user/inline-name';
import { CopyText } from '@/components/copy-text';
import { CampaignProgress } from './progress';

import {
  useCreateCampaignContract,
  IOnCreateCampaignConfirmed,
} from '@/lib/web3/hooks/useCreateCampaignContract';
import { useUpdateCampaign } from '@/lib/hooks/useCampaigns';

interface CampaignCardDashboardProps {
  campaign: DbCampaign;
  onApprove: (campaign: DbCampaign) => Promise<void>;
  onDisable: (campaign: DbCampaign) => Promise<void>;
}
export function CampaignCardAdmin({
  campaign,
  onApprove,
  onDisable,
}: CampaignCardDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: updateCampaign } = useUpdateCampaign();
  const onDeployCampaignConfirmed = useCallback(
    async ({ hash, status, campaignAddress }: IOnCreateCampaignConfirmed) => {
      if (status === 'success') {
        // First update the campaign status to pending_approval
        await updateCampaign({
          campaignId: campaign.id,
          transactionHash: hash,
          status: 'pending_approval',
          campaignAddress,
        });
      }
    },
    [campaign, updateCampaign],
  );
  const { createCampaignContract } = useCreateCampaignContract({
    onConfirmed: onDeployCampaignConfirmed,
  });
  const deployCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        await createCampaignContract({
          startTime: campaign.startTime as unknown as string,
          endTime: campaign.endTime as unknown as string,
          fundingGoal: campaign.fundingGoal,
        });
      } catch (error) {
        console.error(error);
      }
    },
    [createCampaignContract],
  );

  const onDeployIntern = useCallback(async () => {
    if (
      confirm('Really deploy? Campaign treasury will be owned by admin (You).')
    ) {
      setIsLoading(true);
      await deployCampaign(campaign);
      setIsLoading(false);
    }
  }, [deployCampaign, campaign]);

  const onRemoveIntern = useCallback(async () => {
    alert('not implemented yet');
  }, []);
  const onDisableIntern = useCallback(async () => {
    if (
      confirm(
        'Really disable? Campaign will still be active on chain, just invisible to users.',
      )
    ) {
      setIsLoading(true);
      await onDisable(campaign);
      setIsLoading(false);
    }
  }, [campaign, onDisable]);
  const onArchiveIntern = useCallback(async () => {
    alert('not implemented yet');
  }, []);
  const onApproveIntern = useCallback(async () => {
    setIsLoading(true);
    await onApprove(campaign);
    setIsLoading(false);
  }, [onApprove, campaign]);
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <CampaignMainImage campaign={campaign} />
        <div className="absolute">
          <CampaignAdminStatus campaign={campaign} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h2
          className="mb-2 line-clamp-1 text-xl font-bold"
          title={campaign.title ?? 'No Title Set'}
        >
          {campaign.title ?? 'Campaign Title'}
        </h2>

        <div className="space-y-2">
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="align flex gap-2 self-start">
              <UserInlineName user={campaign.creator} />
              <CopyText
                title="Address Copied"
                description="Address copied to your clipboard"
                text={campaign.creatorAddress ?? ''}
                tooltip="Copy Creator Address"
              />
            </div>
            <div className="align flex self-start">
              <MapPin className="mt-0.5 text-[#55DFAB]" />
              <span className="text-sm text-gray-900">
                {campaign.location || 'Earth'}
              </span>
            </div>
          </div>
          <p className="line-clamp-3 text-[12px] text-gray-600">
            {campaign.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="mb-4 cursor-pointer items-center gap-2 text-[14px] text-black underline decoration-black hover:text-gray-600">
              <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                Read More
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
        <div className="w-full flex-1 space-y-2 py-4">
          {/* Display associated rounds */}
          {campaign.rounds && campaign.rounds.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold">Rounds this campaign is part of:</h4>
              <ul className="list-disc pl-5">
                {campaign.rounds.map((round) => (
                  <li key={round.id}>{round.title}</li>
                ))}
              </ul>
            </div>
          )}
          {campaign.startTime && (
            <p>
              <strong>Launch:</strong>{' '}
              <FormattedDate date={campaign.startTime} />
            </p>
          )}
          {campaign.endTime && (
            <p>
              <strong>Deadline:</strong>{' '}
              <FormattedDate date={campaign.endTime} />
            </p>
          )}
          <CampaignProgress campaign={campaign} />
        </div>
        <div className="justify-even w-full flex-row">
          {campaign.status === 'PENDING_APPROVAL' && (
            <Button
              onClick={onApproveIntern}
              className="mt-4 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
              title="Mark this Campaign as approved and make it visible to everyone."
            >
              {isLoading ? 'Processing...' : 'Approve'}
            </Button>
          )}
          {(campaign.status === 'FAILED' ||
            campaign.status === 'COMPLETED' ||
            campaign.status === 'DRAFT') && (
            <Button
              onClick={onRemoveIntern}
              className="mt-4 bg-red-600 hover:bg-red-700"
              disabled={isLoading}
              title="Remove this Campaign from the database"
            >
              {isLoading ? 'Processing...' : 'Remove'}
            </Button>
          )}
          {campaign.status === 'ACTIVE' && (
            <Button
              onClick={onDisableIntern}
              className="mt-4 bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
              title="Mark this Campaign as disabled, making it invisible for everyone."
            >
              {isLoading ? 'Processing...' : 'Disable'}
            </Button>
          )}
          {campaign.status === 'COMPLETED' && (
            <Button
              onClick={onArchiveIntern}
              className="mt-4 bg-gray-600 hover:bg-gray-700"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Archive'}
            </Button>
          )}
          {campaign.status === 'DRAFT' && (
            <Button
              onClick={onDeployIntern}
              className="mt-4 bg-gray-600 hover:bg-gray-700"
              disabled={isLoading}
              title="Use the admin walle to deploy this campaign and make it visible for everyone"
            >
              {isLoading ? 'Processing...' : 'Deploy'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
