import { Metadata } from 'next';
import {
  generateMetadata,
  generateListingMetadata,
} from '@/lib/utils/metadata';

/**
 * Generate metadata for the homepage
 */
export function getHomePageMetadata(): Metadata {
  return generateMetadata({
    title:
      'Relay Funder - Crowdfunding for Refugee Communities & Humanitarian Projects',
    description:
      'Fundraising platform for refugee communities and humanitarian projects. Support campaigns with cryptocurrency through blockchain-powered crowdfunding.',
    type: 'website',
    keywords: [
      'crowdfunding',
      'humanitarian',
      'blockchain',
      'refugee',
      'fundraising',
      'relay funder',
    ],
    authors: [{ name: 'Relay Funder Team' }],
    publisher: 'Relay Funder',
  });
}

/**
 * Generate metadata for listing pages (collections, rounds, features)
 */
export function getListingPageMetadata(
  pageType: 'collections' | 'rounds' | 'features',
  customTitle?: string,
  customDescription?: string,
): Metadata {
  const pageConfigs = {
    collections: {
      title: 'Collections',
      description:
        'Explore curated collections of fundraising campaigns for refugee communities and humanitarian projects on Relay Funder.',
      url: '/collections',
      keywords: ['collections', 'curated campaigns', 'fundraising collections'],
    },
    rounds: {
      title: 'Funding Rounds',
      description:
        'Discover active and upcoming quadratic funding rounds. Support campaigns through matching funds and community voting on Relay Funder.',
      url: '/rounds',
      keywords: [
        'funding rounds',
        'quadratic funding',
        'matching funds',
        'community voting',
      ],
    },
    features: {
      title: 'Features',
      description:
        'Discover the powerful features of Relay Funder: Web3 integration, campaign management, social features, collections, and quadratic funding rounds.',
      url: '/features',
      keywords: [
        'web3',
        'blockchain',
        'campaign management',
        'social features',
        'quadratic funding',
      ],
    },
  };

  const config = pageConfigs[pageType];
  return generateListingMetadata(
    customTitle || config.title,
    customDescription || config.description,
    config.url,
  );
}
