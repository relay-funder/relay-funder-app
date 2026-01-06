'use client';

import { RoundCreate } from '@/components/round/create';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { useMetaTitle } from '@/hooks/use-meta-title';

export default function CreateRoundPage() {
  // Set page title for browser history
  useMetaTitle('Admin Create Round | Relay Funder');

  return (
    <Web3ContextProvider>
      <RoundCreate />
    </Web3ContextProvider>
  );
}
