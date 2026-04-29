import type { Metadata } from 'next';
import { PublicCurrentRoundPage } from '@/components/round/public-current-round';
import { generateListingMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = generateListingMetadata(
  'Current Funding Round',
  'Discover the active or upcoming quadratic funding round on Relay Funder. Support campaigns through matching funds and community voting.',
  '/rounds/current',
);

export default function RoundsCurrentPage() {
  return <PublicCurrentRoundPage />;
}
