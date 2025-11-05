import { Metadata } from 'next';

export interface BaseMetadataOptions {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  siteName?: string;
  locale?: string;
  robots?: string;
  keywords?: string[];
  authors?: Array<{ name: string; url?: string }>;
  creator?: string;
  publisher?: string;
  category?: string;
}

/**
 * Get the base URL for the current environment
 * Handles Vercel deployments, staging, and local development
 */
export function getBaseUrl(): string {
  // Check for Vercel URL (production/staging)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Check for explicit environment URLs
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Environment-based URLs - check staging first to prevent production NODE_ENV override
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
    return 'https://staging.app.relayfunder.com';
  }

  const environment = process.env.NODE_ENV;
  if (environment === 'production') {
    return 'https://app.relayfunder.com';
  }

  // Local development
  return 'http://localhost:3000';
}

export interface CampaignMetadataOptions extends BaseMetadataOptions {
  campaignTitle: string;
  campaignDescription: string;
  fundingGoal: string;
  currentRaised?: string;
  creatorAddress: string;
  campaignImage?: string;
}

/**
 * Generate comprehensive metadata for pages including Open Graph, Twitter Card, and Facebook tags
 * Following Next.js SEO best practices
 */
export function generateMetadata(options: BaseMetadataOptions): Metadata {
  const baseUrl = getBaseUrl();
  const {
    title,
    description,
    url = baseUrl,
    image = `${baseUrl}/relay-funder-logo.png`, // Default OG image
    type = 'website',
    siteName = 'Relay Funder',
    locale = 'en_US',
    robots = 'index,follow',
    keywords = ['crowdfunding', 'humanitarian', 'blockchain', 'relay funder'],
    authors,
    creator = 'Relay Funder',
    publisher = 'Relay Funder',
    category,
  } = options;

  // Ensure title is optimal length (under 60 characters for SEO)
  const optimizedTitle =
    title.length > 60 ? title.substring(0, 57) + '...' : title;

  // Ensure description is not too long for meta tags (under 160 characters)
  const optimizedDescription =
    description.length > 160
      ? description.substring(0, 157) + '...'
      : description;

  const metadata: Metadata = {
    title: optimizedTitle,
    description: optimizedDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    // Basic meta tags
    authors,
    creator,
    publisher,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    // SEO and robots
    robots,
    keywords: keywords.join(', '),
    category,
    // Viewport and theme
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    themeColor: '#000000',
    // Icons and manifest
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    // Open Graph
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: optimizedTitle,
          type: 'image/png',
        },
      ],
      locale,
      type,
    },
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: [
        {
          url: image,
          alt: optimizedTitle,
        },
      ],
      creator: '@relayfunder',
      site: '@relayfunder',
    },
    // Facebook
    facebook: {
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    },
    // Additional meta tags
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': optimizedTitle,
      'twitter:image:alt': optimizedTitle,
      'og:type': type,
      'og:site_name': siteName,
      'og:locale': locale,
    },
  };

  return metadata;
}

/**
 * Generate metadata specifically for campaign detail pages
 * Includes structured data (JSON-LD) for better SEO
 */
export function generateCampaignMetadata(
  options: CampaignMetadataOptions,
): Metadata {
  const baseUrl = getBaseUrl();
  const {
    campaignTitle,
    campaignDescription,
    fundingGoal,
    currentRaised,
    creatorAddress,
    campaignImage,
    url = baseUrl,
    siteName = 'Relay Funder',
    locale = 'en_US',
  } = options;

  // Create campaign-specific title and description
  const title = `${campaignTitle} | Relay Funder`;
  const description =
    campaignDescription.length > 160
      ? campaignDescription.substring(0, 157) + '...'
      : campaignDescription;

  // Use campaign image if available, otherwise default
  const image = campaignImage || `${baseUrl}/relay-funder-logo.png`;

  // Format funding information for description
  const fundingInfo = currentRaised
    ? `$${currentRaised} raised of $${fundingGoal} goal`
    : `$${fundingGoal} funding goal`;

  const enhancedDescription = `${description} - ${fundingInfo}`;

  const metadata = generateMetadata({
    title,
    description: enhancedDescription,
    url,
    image,
    type: 'article',
    siteName,
    locale,
    category: 'Fundraising Campaign',
    keywords: [
      'crowdfunding',
      'humanitarian',
      'blockchain',
      'campaign',
      campaignTitle.toLowerCase(),
    ],
  });

  // Add structured data with article properties
  const otherFields: Record<string, string> = {
    'article:author': creatorAddress,
    'article:section': 'Campaigns',
    'article:tag': 'crowdfunding,humanitarian,blockchain',
  };

  // Merge with existing other fields, filtering out any undefined values
  metadata.other = {
    ...metadata.other,
    ...otherFields,
  } as Record<string, string | number | (string | number)[]>;

  return metadata;
}

/**
 * Generate metadata for listing/collection pages
 */
export function generateListingMetadata(
  title: string,
  description: string,
  url?: string,
  image?: string,
): Metadata {
  return generateMetadata({
    title: `${title} | Relay Funder`,
    description,
    url,
    image,
    type: 'website',
    keywords: [
      'crowdfunding',
      'humanitarian',
      'blockchain',
      'relay funder',
      title.toLowerCase(),
    ],
  });
}

/**
 * Generate JSON-LD structured data for campaigns
 */
export function generateCampaignStructuredData(
  options: CampaignMetadataOptions,
) {
  const baseUrl = getBaseUrl();
  const {
    campaignTitle,
    campaignDescription,
    fundingGoal,
    currentRaised,
    creatorAddress,
    campaignImage,
    url = baseUrl,
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'FundraisingCampaign',
    name: campaignTitle,
    description: campaignDescription,
    url,
    image: campaignImage || `${baseUrl}/relay-funder-logo.png`,
    organizer: {
      '@type': 'Organization',
      name: 'Relay Funder',
      url: baseUrl,
    },
    creator: {
      '@type': 'Person',
      identifier: creatorAddress,
    },
    targetFunding: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: fundingGoal,
    },
    ...(currentRaised && {
      raisedFunding: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: currentRaised,
      },
    }),
    startDate: new Date().toISOString(),
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationStructuredData() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Relay Funder',
    url: baseUrl,
    logo: `${baseUrl}/relay-funder-logo.png`,
    description:
      'Fundraising platform for refugee communities and humanitarian projects',
    sameAs: [
      // Add social media URLs when available
    ],
  };
}
