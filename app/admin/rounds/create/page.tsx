import { RoundCreate } from '@/components/round/create';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export default function CreateRoundPage() {
  return (
    <Web3ContextProvider>
      <RoundCreate />
    </Web3ContextProvider>
  );
}
