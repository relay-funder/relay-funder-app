import { type ReactNode } from 'react';
import { ContentArea, FullWidthContainer } from '@/components/layout';

export function PageDashboard({
  children,
  title = 'Dashboard',
  actions,
}: {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <div className="w-full border-b border-gray-200 bg-white">
        <FullWidthContainer variant="edge-to-edge" padding="sm">
          <ContentArea title={title} actions={actions} spacing="tight">
            <div></div>
          </ContentArea>
        </FullWidthContainer>
      </div>
      <div className="flex min-h-[calc(100svh-200px)] w-full flex-col bg-gray-50">
        <FullWidthContainer variant="edge-to-edge" padding="sm">
          {children}
        </FullWidthContainer>
      </div>
    </>
  );
}
