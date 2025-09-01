import type { Chain } from 'viem';
import { useSwitchChain, chainConfig } from '@/lib/web3';
import { Button, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

export function WalletChain({
  chain,
  isCurrent = false,
}: {
  chain: Chain;
  isCurrent?: boolean;
}) {
  const { switchChainAsync } = useSwitchChain();
  const isPreferred = chain.id === chainConfig.chainId;

  return (
    <Card
      className={cn(
        'p-4',
        isPreferred && 'border-2 border-blue-500',
        isCurrent && isPreferred && 'border-green-500 bg-green-100',
      )}
    >
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
          {isCurrent && !isPreferred && (
            <span className="text-sm text-red-500">
              {chainConfig.name} is preferred. Some features might fail.
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
