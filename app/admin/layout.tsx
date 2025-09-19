import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { Suspense } from 'react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Web3ContextProvider>
      <Suspense>{children}</Suspense>
    </Web3ContextProvider>
  );
}
