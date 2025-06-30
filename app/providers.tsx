'use client';

import { Suspense, type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
import {
  AuthProvider,
  SidebarProvider,
  FeatureFlagsProvider,
  EnvironmentProvider,
  CollectionProvider,
} from '@/contexts';
import { getQueryClient } from '@/lib/query-client';

const queryClient = getQueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Web3ContextProvider>
          <FeatureFlagsProvider>
            <SidebarProvider>
              <EnvironmentProvider>
                <Suspense>
                  <AuthProvider>
                    <CollectionProvider>{children}</CollectionProvider>
                  </AuthProvider>
                </Suspense>
              </EnvironmentProvider>
            </SidebarProvider>
          </FeatureFlagsProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </Web3ContextProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
