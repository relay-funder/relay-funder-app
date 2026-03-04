import { Metadata } from 'next';
import { PublicRoundResultsDetail } from '@/components/round/public-results-detail';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Round | Relay Funder',
};

export default async function RoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const roundId = Number.parseInt(paramId, 10);
  if (Number.isNaN(roundId)) {
    notFound();
  }

  return <PublicRoundResultsDetail roundId={roundId} />;
}
