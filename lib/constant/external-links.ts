/**
 * External links configuration
 * Centralized configuration for all external links used in the application
 */
export const EXTERNAL_LINKS = {
  TWITTER: 'https://x.com/RelayFunder',
  GITHUB: 'https://github.com/relay-funder',
  ABOUT: 'https://www.relayfunder.com/',
  PRIVACY: 'https://www.relayfunder.com/privacy',
  TERMS: 'https://www.relayfunder.com/terms',
  PARTNERS: 'https://www.relayfunder.com/partners',
  FAQ: 'https://www.relayfunder.com/faq',
} as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
