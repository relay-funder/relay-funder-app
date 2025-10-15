import { ReactNode } from 'react';
import { ContentArea } from '@/components/layout';

export function PageDefaultContent({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <ContentArea title={title} spacing="normal" className="text-center">
      {children}
    </ContentArea>
  );
}
