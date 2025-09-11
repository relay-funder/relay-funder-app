import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui';
import type { CampaignItemProps } from '@/types/campaign';
import { FormattedDate } from '@/components/formatted-date';
import { CampaignMainImage } from './main-image';
import { CampaignAdminStatus } from './admin-status';
import { UserInlineName } from '@/components/user/inline-name';
import { CopyText } from '@/components/copy-text';
import { CampaignProgress } from './progress';
import { TreasuryBalanceCompact } from './treasury-balance';

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

          {/* Treasury Balance for Admin View - Only show if different from main progress */}
          {campaign?.treasuryAddress && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">
                On-chain Treasury:{' '}
                <TreasuryBalanceCompact
                  treasuryAddress={campaign.treasuryAddress}
                />
              </div>
            </div>
          )}

          {/* Admin Contract Addresses */}
          <div className="mt-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
            <div className="space-y-2">
              <div>
                <div className="mb-1 font-medium text-gray-600">
                  Campaign Contract:
                </div>
                {campaign?.campaignAddress ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded border bg-white px-2 py-1 font-mono text-xs text-blue-700">
                      {campaign.campaignAddress.slice(0, 10)}...
                      {campaign.campaignAddress.slice(-8)}
                    </code>
                    <CopyText
                      text={campaign.campaignAddress}
                      tooltip="Copy Campaign Address"
                      title="Address Copied"
                      description="Campaign address copied to clipboard"
                    />
                  </div>
                ) : (
                  <div className="font-medium text-red-600">
                    Contract not deployed
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1 font-medium text-gray-600">
                  Treasury Contract:
                </div>
                {campaign?.treasuryAddress ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded border bg-white px-2 py-1 font-mono text-xs text-green-700">
                      {campaign.treasuryAddress.slice(0, 10)}...
                      {campaign.treasuryAddress.slice(-8)}
                    </code>
                    <CopyText
                      text={campaign.treasuryAddress}
                      tooltip="Copy Treasury Address"
                      title="Address Copied"
                      description="Treasury address copied to clipboard"
                    />
                  </div>
                ) : (
                  <div className="font-medium text-orange-600">
                    Treasury not deployed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <CampaignCardAdminActions campaign={campaign} />
      </CardFooter>
    </Card>
  );
}
