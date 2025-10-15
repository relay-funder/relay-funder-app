import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Relay Funder',
  description:
    'Manage your Relay Funder profile, payment methods, and Wallet information',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
