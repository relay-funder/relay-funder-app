import { type ReactNode } from 'react';
export function PageMainTwoColumns({ children }: { children: ReactNode }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">{children}</div>
    </main>
  );
}
