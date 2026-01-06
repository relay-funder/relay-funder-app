import { Metadata } from 'next';
import { getListingPageMetadata } from '@/components/metadata';

export const metadata: Metadata = getListingPageMetadata('features');

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
