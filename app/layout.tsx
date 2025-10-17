import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/toaster';
import { PageMainLayout } from '@/components/page/main-layout';
import { EnvironmentBadge } from '@/components/environment-badge';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Relay Funder',
  description: 'Fundraising platform for refugee communities and humanitarian projects',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PageMainLayout>{children}</PageMainLayout>
          <Toaster />
          <EnvironmentBadge />
        </Providers>
      </body>
    </html>
  );
}
