import { type ReactNode } from 'react';
import { FullWidthContainer } from '@/components/layout';

export function PageMainTwoColumns({ children }: { children: ReactNode }) {
  return (
    <main className="w-full">
      <FullWidthContainer variant="default" padding="lg">
        <div className="grid gap-8 lg:grid-cols-2">{children}</div>
      </FullWidthContainer>
    </main>
  );
}
