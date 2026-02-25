import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/toaster';
import { PageMainLayout } from '@/components/page/main-layout';
import { EnvironmentBadge } from '@/components/environment-badge';
import { ConfirmProvider } from '@/contexts/ConfirmContext';
import { Analytics } from '@vercel/analytics/react';
import { generateMetadata as generateBaseMetadata } from '@/lib/utils/metadata';

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

export const metadata = generateBaseMetadata({
  title: 'Relay Funder',
  description:
    'Fundraising platform for refugee communities and humanitarian projects',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script strategy="beforeInteractive" src="/theme-init.js" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfirmProvider>
          <Providers>
            <PageMainLayout>{children}</PageMainLayout>
            <Toaster />
            <EnvironmentBadge />
            <Analytics />
          </Providers>
        </ConfirmProvider>
      </body>
    </html>
  );
}
