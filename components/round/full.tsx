'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { PageHome } from '@/components/page/home';

import { useRound } from '@/lib/hooks/useRounds';
import { RoundLoading } from './loading';

import { RoundCardFull } from './card-full';

export function RoundFull({ id }: { id: number }) {
  const { data: roundInstance, isPending } = useRound(id);
  if (isPending) {
    return <RoundLoading />;
  }
  const round = roundInstance?.round;
  if (!round) {
    notFound();
  }

  const header = <PageHeader title={round.title} />;
  return (
    <PageHome header={header}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="relative flex flex-col p-0 lg:col-span-8">
          {/*<RoundMainImage round={round} />*/}
        </div>
        <div className="lg:col-span-4">
          <RoundCardFull round={round} />
        </div>
      </div>
    </PageHome>
  );
}
