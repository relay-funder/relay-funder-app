'use client';

import {
  useInfiniteUserDonations,
  type UserDonation,
} from '@/lib/hooks/useDonations';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { Heart, ExternalLink, Target, Zap, MapPin } from 'lucide-react';
import { chainConfig } from '@/lib/web3';
import { Category } from '@/components/shared/category';
import Link from 'next/link';
import Image from 'next/image';

interface DonationItemProps {
  donation: UserDonation;
}

function DonationItem({ donation }: DonationItemProps) {
  const { campaign } = donation;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Campaign Image */}
          <div className="shrink-0">
            {campaign.image ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                <Target className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Campaign Info */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="text-lg font-semibold leading-tight text-gray-900 hover:text-blue-600"
              >
                {campaign.title}
              </Link>
              {campaign.isCompleted && (
                <Badge className="ml-2 shrink-0 bg-blue-100 text-blue-800">
                  Completed
                </Badge>
              )}
            </div>

            {/* Category and Location */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <Category categoryId={campaign.category} />
              {campaign.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{campaign.location}</span>
                </div>
              )}
            </div>

            {/* Donation Details */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Donation</div>
                <div className="text-2xl font-bold">
                  ${donation.amount.toFixed(2)}
                </div>
              </div>

              {donation.roundContribution && (
                <div className="space-y-1 text-right">
                  <div className="text-sm text-gray-500">Impact Bet</div>
                  <div className="text-lg font-semibold text-blue-600">
                    ${(donation.amount * 0.05).toFixed(2)} (5.0%)
                  </div>
                </div>
              )}

              {donation.roundContribution && (
                <div className="space-y-1 text-right">
                  <div className="text-sm text-gray-500">Reward</div>
                  <div className="text-lg font-semibold text-orange-600">
                    ${(donation.amount * 0.083).toFixed(2)}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-right">
                <div className="text-sm text-gray-500">Date</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(donation.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Round Information */}
            {donation.roundContribution && (
              <div className="flex items-center gap-2 rounded-md bg-purple-50 p-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">
                  {donation.roundContribution.round.title}
                </span>
                <span className="text-xs text-purple-600">
                  • Humanity Score: {donation.roundContribution.humanityScore}
                </span>
              </div>
            )}
          </div>

          {/* Transaction Link - Subtle */}
          <div className="shrink-0">
            {donation.transactionHash && (
              <a
                href={`${chainConfig.blockExplorerUrl}/tx/${donation.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-gray-600"
                title="View transaction details"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DonationHistory() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserDonations({ pageSize: 20 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (loading && !data) {
    return <CampaignLoading minimal={true} />;
  }

  if (error) {
    return <CampaignError error={error.message} />;
  }

  const donations = data?.pages.flatMap((page) => page.donations) || [];

  if (donations.length === 0) {
    return (
      <div className="py-12 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No contributions yet
        </h3>
        <p className="mb-6 text-gray-500">
          Start supporting campaigns you care about to see your impact here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Explore Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Simple donation list */}
      {donations.map((donation) => (
        <DonationItem key={donation.id} donation={donation} />
      ))}

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="py-8">
          <CampaignLoading minimal={true} />
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={ref} className="h-10" />
    </div>
  );
}
