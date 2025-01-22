import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster"
import { NetworkCheck } from "@/components/network-check";
import { MainLayout } from '@/components/main-layout'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Akashic",
  description: "Fundraising platform for open source projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NetworkCheck>
            <MainLayout>
              {children}
            </MainLayout>
          </NetworkCheck>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
