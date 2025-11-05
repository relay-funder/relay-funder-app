import { Metadata } from 'next';
import {
  generateCampaignMetadata,
  generateCampaignStructuredData,
} from '@/lib/utils/metadata';

interface CampaignMetadataOptions {
  campaignTitle: string;
  campaignDescription: string;
  fundingGoal: string;
  currentRaised?: string;
  creatorAddress: string;
  campaignImage?: string;
  slug: string;
  title?: string;
  description?: string;
  startDate?: Date;
}

/**
 * Generate metadata for campaign detail pages
 */
export function getCampaignPageMetadata(
  options: CampaignMetadataOptions,
): Metadata {
  const {
    campaignTitle,
    campaignDescription,
    fundingGoal,
    currentRaised,
    creatorAddress,
    campaignImage,
    slug,
    startDate,
  } = options;

  return generateCampaignMetadata({
    title: options.title || campaignTitle,
    description: options.description || campaignDescription,
    campaignTitle,
    campaignDescription,
    fundingGoal,
    currentRaised,
    creatorAddress,
    campaignImage,
    startDate,
    url: `/campaigns/${slug}`,
  });
}

/**
 * Generate structured data for campaigns
 */
export function getCampaignStructuredData(options: CampaignMetadataOptions) {
  const {
    campaignTitle,
    campaignDescription,
    fundingGoal,
    currentRaised,
    creatorAddress,
    campaignImage,
    slug,
    startDate,
  } = options;

  return generateCampaignStructuredData({
    campaignTitle,
    campaignDescription,
    fundingGoal,
    currentRaised,
    creatorAddress,
    campaignImage,
    startDate,
    url: `/campaigns/${slug}`,
    title: options.title || campaignTitle,
    description: options.description || campaignDescription,
  });
}
