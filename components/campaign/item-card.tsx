'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  Button,
  Badge,
} from '@/components/ui';

import Image from 'next/image';
import Link from 'next/link';

import { CampaignMainImageCard } from '@/components/campaign/main-image-card';

import type { CampaignItemProps } from '@/types/campaign';
import { UserInlineName } from '@/components/user/inline-name';

import { CampaignLocation } from './location';
import { CampaignProgress } from './progress';
import { CampaignRoundsIndicator } from './rounds-indicator';
import { useCampaignCategory } from '@/hooks/use-campaign-category';
import {
  isCampaignDonatable,
  getCampaignStatusInfo,
} from '@/lib/utils/campaign-status';

export function CampaignItemCard({ campaign }: CampaignItemProps) {
  const { details: categoryDetails } = useCampaignCategory({ campaign });
  const campaignStatusInfo = getCampaignStatusInfo(campaign);
  const canDonate = isCampaignDonatable(campaign);

  if (!campaign) {
    return (
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex-1">
          <CardHeader className="p-0">
            <CampaignMainImageCard campaign={campaign} />
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="mb-2 line-clamp-1 text-xl font-bold">
                Create Campaign
              </h2>
            </div>
            <div className="mb-2 flex items-center justify-between gap-1"></div>
            <p className="line-clamp-3 text-[12px] text-gray-600">
              Create a Campaign
            </p>
          </CardContent>
          <div className="mt-auto space-y-2 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex">
                <div className="px-1 font-bold text-[#55DFAB]">
                  {Math.floor(Math.random() * 100)}
                </div>
                donations
              </span>
              <span className="flex">
                <div className="px-1 font-bold text-[#55DFAB]">0%</div>
                of funding goal
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
              <span>0 raised</span>
              <span>
                Goal: <b>Set Goal</b>
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card
      key={campaign.id}
      className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <Link href={`/campaigns/${campaign.slug}`}>
        <CardHeader className="relative p-0">
          <CampaignMainImageCard campaign={campaign} />
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2
                className="mb-2 line-clamp-1 text-xl font-bold"
                title={campaign?.title ?? 'No Title Set'}
              >
                {campaign?.title ?? 'Campaign Title'}
              </h2>
              {!canDonate && (
                <Badge variant={campaignStatusInfo.variant} className="ml-2">
                  {campaignStatusInfo.status}
                </Badge>
              )}
              {categoryDetails && (
                <Badge
                  variant="outline"
                  className="ml-2 flex items-center gap-1"
                >
                  <span>{categoryDetails.icon}</span>
                  <span className="text-xs">{categoryDetails.name}</span>
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="mb-2 flex items-center justify-between gap-1">
              <div className="align flex gap-2 self-start">
                <UserInlineName user={campaign?.creator} />
              </div>
              <CampaignLocation campaign={campaign} />
            </div>
            <div className="mb-2 flex items-end justify-end gap-1">
              <CampaignRoundsIndicator campaign={campaign} />
            </div>
            <p className="line-clamp-3 text-[12px] text-gray-600">
              {campaign?.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="mb-4 cursor-pointer items-center gap-2 text-[14px] text-black underline decoration-black hover:text-gray-600">
                Read More
              </div>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
        <div className="w-full flex-1 space-y-2 py-4">
          <CampaignProgress campaign={campaign} />
        </div>
        <div className="flex w-full flex-row align-middle">
          {canDonate ? (
            <Link
              href={`/campaigns/${campaign.slug}/donation`}
              className="flex-1"
            >
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Image src="/diamond.png" alt="wallet" width={24} height={24} />
                Donate
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="w-full cursor-not-allowed bg-gray-400"
              title={campaignStatusInfo.description}
            >
              <Image
                src="/diamond.png"
                alt="wallet"
                width={24}
                height={24}
                className="opacity-50"
              />
              {campaignStatusInfo.status}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
