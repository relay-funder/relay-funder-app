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
  ThemeProvider,
} from '@/contexts';
import { getQueryClient } from '@/lib/query-client';

const queryClient = getQueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FeatureFlagsProvider>
            <SidebarProvider>
              <EnvironmentProvider>
                <AuthProvider>{children}</AuthProvider>
              </EnvironmentProvider>
            </SidebarProvider>
          </FeatureFlagsProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
