import { type ReactNode } from 'react';
import { FullWidthContainer } from '@/components/layout';
import { UnifiedHeader, type UnifiedHeaderProps } from './unified-header';

interface UnifiedLayoutProps extends UnifiedHeaderProps {
  children: ReactNode;
}

export function UnifiedLayout({
  children,
  ...headerProps
}: UnifiedLayoutProps) {
  return (
    <>
      <UnifiedHeader {...headerProps} />
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
