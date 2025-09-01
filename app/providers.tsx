'use client';

import { type ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
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
        <FeatureFlagsProvider>
          <SidebarProvider>
            <EnvironmentProvider>
              <AuthProvider>
                <CollectionProvider>{children}</CollectionProvider>
              </AuthProvider>
            </EnvironmentProvider>
          </SidebarProvider>
        </FeatureFlagsProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
