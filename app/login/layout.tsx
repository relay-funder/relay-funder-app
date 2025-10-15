import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { Suspense } from 'react';

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Login layout should NOT duplicate PageMainLayout - it inherits from root layout
  return (
    <Web3ContextProvider>
      <Suspense>{children}</Suspense>
    </Web3ContextProvider>
  );
}
