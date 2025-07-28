import type { Chain } from 'viem';
import { useSwitchChain } from '@/lib/web3';
import { Button, Card, CardContent } from '@/components/ui';

export function WalletChain({
  chain,
  isCurrent = false,
}: {
  chain: Chain;
  isCurrent?: boolean;
}) {
  const { switchChainAsync } = useSwitchChain();

  return (
    <Card className={`p-4 ${isCurrent ? 'border-2 border-primary' : ''}`}>
      <CardContent className="flex flex-col items-start p-0">
        <div className="flex w-full items-center justify-between">
          {chain.blockExplorers?.default?.url ? (
            <a
              href={chain.blockExplorers.default.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {chain.name} (ID: {chain.id})
            </a>
          ) : (
            <span>
              {chain.name} (ID: {chain.id})
            </span>
          )}
          {!isCurrent && (
            <Button
              onClick={() => switchChainAsync({ chainId: chain.id })}
              size="sm"
            >
              Switch
            </Button>
          )}
        </div>
        {chain.testnet && (
          <span className="text-sm text-gray-500">(Testnet)</span>
        )}
      </CardContent>
    </Card>
  );
}
