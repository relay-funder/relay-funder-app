import { prefetchCampaign, getCampaign } from '@/lib/api/campaigns';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Metadata } from 'next';
import { getQueryClient } from '@/lib/query-client';
import {
  getCampaignPageMetadata,
  getCampaignStructuredData,
  CampaignStructuredData,
} from '@/components/metadata';
import { CampaignFull } from '@/components/campaign/full';
import type { GetCampaignResponseInstance } from '@/lib/api/types/campaigns';

/**
 * Extract the main image URL from campaign media
 */
function getCampaignMainImage(campaign: GetCampaignResponseInstance): string | undefined {
  // Check for new media format with mediaOrder
  if (
    Array.isArray(campaign?.media) &&
    Array.isArray(campaign.mediaOrder) &&
    campaign.media.length &&
    campaign.mediaOrder.length
  ) {
    const firstMedia = campaign.media
      .filter(({ mimeType }) => mimeType.startsWith('image'))
      .find(({ id }) => id === campaign.mediaOrder?.at(0));
    if (firstMedia?.url && typeof firstMedia.url === 'string') {
      return firstMedia.url;
    }
  }

  return undefined;
}

/**
 * Extract campaign metadata for both metadata generation and structured data
 */
function extractCampaignMetadata(campaign: GetCampaignResponseInstance) {
  const mainImage = getCampaignMainImage(campaign);
  const fundingGoal = campaign.fundingGoal || '0';

  // Calculate total raised from payment summary
  const totalRaised = campaign.paymentSummary?.token
    ? Object.values(campaign.paymentSummary.token).reduce(
        (total, tokenData) => total + (tokenData.confirmed || 0),
        0
      ).toString()
    : '0';

  return {
    mainImage,
    fundingGoal,
    totalRaised,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  try {
    const campaign = await getCampaign(slug);

    if (!campaign) {
      return {
        title: 'Campaign Not Found | Relay Funder',
        description: 'The requested campaign could not be found.',
      };
    }

    const { mainImage, fundingGoal, totalRaised } = extractCampaignMetadata(campaign);

    return getCampaignPageMetadata({
      campaignTitle: campaign.title,
      campaignDescription: campaign.description || '',
      fundingGoal,
      currentRaised: totalRaised,
      creatorAddress: campaign.creatorAddress,
      campaignImage: mainImage,
      slug,
    });
  } catch (error) {
    // Fallback metadata if campaign fetch fails
    return {
      title: `Campaign | Relay Funder`,
      description: 'View this fundraising campaign on Relay Funder.',
    };
  }
}

export default async function CampaignPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const queryClient = getQueryClient();

  // Prefetch campaign data
  await prefetchCampaign(queryClient, slug);

  // Get campaign data for structured data
  let structuredData = null;
  try {
    const campaign = await getCampaign(slug);
    if (campaign) {
      const { mainImage, fundingGoal, totalRaised } = extractCampaignMetadata(campaign);

      structuredData = getCampaignStructuredData({
        campaignTitle: campaign.title,
        campaignDescription: campaign.description || '',
        fundingGoal,
        currentRaised: totalRaised,
        creatorAddress: campaign.creatorAddress,
        campaignImage: mainImage,
        slug,
      });
    }
  } catch (error) {
    // Silently fail if we can't generate structured data
  }

  return (
    <>
      {structuredData && <CampaignStructuredData data={structuredData} />}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CampaignFull slug={slug} />
      </HydrationBoundary>
    </>
  );
}
