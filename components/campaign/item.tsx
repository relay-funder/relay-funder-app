'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Progress,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
  Badge,
} from '@/components/ui';
import { Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/lib/constant';
import { FormattedDate } from '@/components/formatted-date';
import { CampaignMainImage } from '@/components/campaign/main-image';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import type { CampaignItemProps } from '@/types/campaign';
import { UserInlineName } from '@/components/user/inline-name';
import ContractLink from '../page/contract-link';
import { chainConfig } from '@/lib/web3';
import { CampaignLocation } from './location';
import { CampaignProgress } from './progress';
import { CampaignRoundsIndicator } from './rounds-indicator';

export function CampaignItem({ campaign, onSelect }: CampaignItemProps) {
  const categoryDetails = campaign?.category
    ? categories.find((category) => category.id === campaign.category)
    : null;
  const { amountRaised, amountGoal } = useCampaignStatsFromInstance({
    campaign,
  });
  if (!campaign) {
    return (
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex-1">
          <CardHeader className="p-0">
            <CampaignMainImage campaign={campaign} />
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
            <Progress value={0} className="h-2" />
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
          <CampaignMainImage campaign={campaign} />
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
          <Link
            href={`/campaigns/${campaign.slug}/donation`}
            className="flex-1"
          >
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Image src="/diamond.png" alt="wallet" width={24} height={24} />
              Donate
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => typeof onSelect === 'function' && onSelect(campaign)}
          >
            <Image src="/sparkles.png" alt="wallet" width={24} height={24} />
            Add to Collection
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Info className="mr-2 h-4 w-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Info</DialogTitle>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableCell>
                      <ContractLink
                        address={campaign.campaignAddress}
                        chainConfig={chainConfig}
                      >
                        {campaign.campaignAddress ?? 'No Address'}
                      </ContractLink>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableCell>
                      <UserInlineName user={campaign.creator} />{' '}
                      {campaign.creatorAddress}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Launch Time</TableHead>
                    <TableCell>
                      <FormattedDate date={campaign.startTime} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Deadline</TableHead>
                    <TableCell>
                      <FormattedDate date={campaign.endTime} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Goal Amount</TableHead>
                    <TableCell>{amountGoal}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Total Raised</TableHead>
                    <TableCell>{amountRaised}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}
