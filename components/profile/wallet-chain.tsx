import type { Chain } from 'viem';
import { useSwitchChain, chainConfig } from '@/lib/web3';
import { Button } from '@/components/ui';

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
    <div className="space-y-2">
      <div className="flex w-full items-center justify-between">
        <div>
          {chain.blockExplorers?.default?.url ? (
            <a
              href={chain.blockExplorers.default.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline hover:text-accent-foreground"
            >
              {chain.name}
            </a>
          ) : (
            <span className="font-medium text-foreground">{chain.name}</span>
          )}
          <span className="ml-2 text-sm text-muted-foreground">
            (ID: {chain.id})
          </span>
          {chain.testnet && (
            <span className="ml-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              Testnet
            </span>
          )}
        </div>
        {!isCurrent ||
          (!isPreferred && (
            <Button
              onClick={() => switchChainAsync({ chainId: chain.id })}
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
            >
              Switch
            </Button>
          ))}
      </div>
      {isCurrent && !isPreferred && (
        <p className="rounded bg-destructive/5 p-2 text-xs text-destructive">
          {chainConfig.name} is preferred. Some features might not work
          correctly on this network.
        </p>
      )}
      {isCurrent && isPreferred && (
        <p className="text-xs text-muted-foreground">
          ✓ Connected to the preferred network
        </p>
      )}
    </div>
  );
}
