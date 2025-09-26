import { type ReactNode } from 'react';
import { FullWidthContainer } from '@/components/layout';

export function PageHome({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {header}
      <div className="flex min-h-screen w-full flex-col bg-gray-50">
        <main className="w-full">
          <FullWidthContainer variant="default" padding="sm">
            {children}
          </FullWidthContainer>
        </main>
      </div>
    </>
  );
}
