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
} as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
