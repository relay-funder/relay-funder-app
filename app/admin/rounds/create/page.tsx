import { RoundCreateForm } from '@/components/round/create-form';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export default function CreateRoundPage() {
  return (
    <Web3ContextProvider>
      <RoundCreateForm />
    </Web3ContextProvider>
  );
}
