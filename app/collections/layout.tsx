import { Metadata } from 'next';
import { getListingPageMetadata } from '@/components/metadata';

export const metadata: Metadata = getListingPageMetadata('collections');

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
