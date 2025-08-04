import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../globals.css';
import Providers from '../providers';
import { Toaster } from '@/components/ui/toaster';
import { PageMainLayout } from '@/components/page/main-layout';
import { EnvironmentBadge } from '@/components/environment-badge';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { Suspense } from 'react';
const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Akashic',
  description: 'Fundraising platform for open source projects',
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
          <Web3ContextProvider>
            <PageMainLayout>
              <Suspense>{children}</Suspense>
            </PageMainLayout>
          </Web3ContextProvider>
          <Toaster />
          <EnvironmentBadge />
        </Providers>
      </body>
    </html>
  );
}
