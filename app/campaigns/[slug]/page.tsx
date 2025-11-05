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

/**
 * Extract the main image URL from campaign media or legacy images
 */
function getCampaignMainImage(campaign: any): string | undefined {
  // Check for new media format with mediaOrder
  if (
    Array.isArray(campaign?.media) &&
    Array.isArray(campaign.mediaOrder) &&
    campaign.media.length &&
    campaign.mediaOrder.length
  ) {
    const firstMedia = campaign.media
      .filter(({ mimeType }: { mimeType: string }) =>
        mimeType.startsWith('image'),
      )
      .find(({ id }: { id: string }) => id === campaign.mediaOrder?.at(0));
    if (firstMedia?.url) {
      return firstMedia.url;
    }
  }

  // Check for legacy images format
  if (Array.isArray(campaign?.images)) {
    const legacyImage =
      campaign.images.find((img: any) => img.isMainImage) || campaign.images[0];
    if (legacyImage?.imageUrl) {
      return legacyImage.imageUrl;
    }
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const campaign = await getCampaign(slug);

    if (!campaign) {
      return {
        title: 'Campaign Not Found | Relay Funder',
        description: 'The requested campaign could not be found.',
      };
    }

    const mainImage = getCampaignMainImage(campaign);
    const fundingGoal = campaign.fundingGoal || '0';

    // Calculate total raised from payment summary
    const totalRaised = campaign.paymentSummary?.token
      ? Object.values(campaign.paymentSummary.token).reduce(
          (total, tokenData) => total + (tokenData.confirmed || 0),
          0
        ).toString()
      : '0';

    return getCampaignPageMetadata({
      campaignTitle: campaign.title,
      campaignDescription: campaign.description || '',
      fundingGoal,
      currentRaised: totalRaised,
      creatorAddress: campaign.creatorAddress,
      campaignImage: mainImage,
      status: campaign.status,
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const queryClient = getQueryClient();

  // Prefetch campaign data
  await prefetchCampaign(queryClient, slug);

  // Get campaign data for structured data
  let structuredData = null;
  try {
    const campaign = await getCampaign(slug);
    if (campaign) {
      const mainImage = getCampaignMainImage(campaign);
      const fundingGoal = campaign.fundingGoal || '0';

      // Calculate total raised from payment summary
      const totalRaised = campaign.paymentSummary?.token
        ? Object.values(campaign.paymentSummary.token).reduce(
            (total, tokenData) => total + (tokenData.confirmed || 0),
            0
          ).toString()
        : '0';

      structuredData = getCampaignStructuredData({
        campaignTitle: campaign.title,
        campaignDescription: campaign.description || '',
        fundingGoal,
        currentRaised: totalRaised,
        creatorAddress: campaign.creatorAddress,
        campaignImage: mainImage,
        status: campaign.status,
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
