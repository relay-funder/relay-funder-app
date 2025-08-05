import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui';
import type { CampaignItemProps } from '@/types/campaign';
import { FormattedDate } from '@/components/formatted-date';
import { CampaignMainImage } from './main-image';
import { CampaignAdminStatus } from './admin-status';
import { UserInlineName } from '@/components/user/inline-name';
import { CopyText } from '@/components/copy-text';
import { CampaignProgress } from './progress';

import { CampaignCardAdminActions } from './card-admin-actions';
import { CampaignLocation } from './location';

export function CampaignCardAdmin({ campaign }: CampaignItemProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="relative p-0">
        <CampaignMainImage campaign={campaign} />
        <div className="absolute pl-1">
          <CampaignAdminStatus campaign={campaign} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h2
          className="mb-2 line-clamp-1 text-xl font-bold"
          title={campaign?.title ?? 'No Title Set'}
        >
          {campaign?.title ?? 'Campaign Title'}
        </h2>

        <div className="space-y-2">
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="align flex gap-2 self-start">
              <UserInlineName user={campaign?.creator} />
              <CopyText
                title="Address Copied"
                description="Address copied to your clipboard"
                text={campaign?.creatorAddress ?? ''}
                tooltip="Copy Creator Address"
              />
            </div>
            <CampaignLocation campaign={campaign} />
          </div>
          <p className="line-clamp-3 text-[12px] text-gray-600">
            {campaign?.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="mb-4 cursor-pointer items-center gap-2 text-[14px] text-black underline decoration-black hover:text-gray-600">
              <Link href={`/campaigns/${campaign?.slug}`} target="_blank">
                Read More
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
        <div className="w-full flex-1 space-y-2 py-4">
          {/* Display associated rounds */}
          {campaign?.rounds && campaign?.rounds?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold">Rounds this campaign is part of:</h4>
              <ul className="list-disc pl-5">
                {campaign.rounds.map((round) => (
                  <li key={round.id}>{round.title}</li>
                ))}
              </ul>
            </div>
          )}
          {campaign?.startTime && (
            <p>
              <strong>Launch:</strong>{' '}
              <FormattedDate date={campaign.startTime} />
            </p>
          )}
          {campaign?.endTime && (
            <p>
              <strong>Deadline:</strong>{' '}
              <FormattedDate date={campaign.endTime} />
            </p>
          )}
          <CampaignProgress campaign={campaign} />
        </div>
        <CampaignCardAdminActions campaign={campaign} />
      </CardFooter>
    </Card>
  );
}
