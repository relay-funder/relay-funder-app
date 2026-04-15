import { PublicCurrentRoundPage } from '@/components/round/public-current-round';
import { PublicRoundResultsList } from '@/components/round/public-results-list';

export default async function RoundsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;

  if (view === 'current') {
    return <PublicCurrentRoundPage />;
  }

  return <PublicRoundResultsList />;
}
