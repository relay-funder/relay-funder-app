import type { Metadata } from 'next';
import { PublicRoundResultsList } from '@/components/round/public-results-list';
import { generateListingMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = generateListingMetadata(
  'Past Funding Rounds',
  'Browse past quadratic funding rounds on Relay Funder. See campaign results, matching distributions, and community impact.',
  '/rounds/past',
  '/opengraph-image',
);

export default function RoundsPastPage() {
  return <PublicRoundResultsList />;
}
