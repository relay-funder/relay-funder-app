import { Metadata } from 'next';
import { getListingPageMetadata } from '@/components/metadata';

export const metadata: Metadata = getListingPageMetadata('rounds');

export default function RoundsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
