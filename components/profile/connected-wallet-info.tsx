import { Loader2 } from 'lucide-react';
import { useChains, useCurrentChain, useAccount, useBalance } from '@/lib/web3';
import { USDC_ADDRESS } from '@/lib/constant';
import { WalletChain } from './wallet-chain';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

export function ConnectedWalletInfo() {
  const { address } = useAccount();
  const { data: balance, isPending: balanceIsPending } = useBalance({
    address: address as `0x${string}`,
  });
  const chains = useChains();
  const { chain: currentChain } = useCurrentChain();
  const { data: usdcBalance, isPending: usdcBalanceIsPending } = useBalance({
    address: address as `0x${string}`,
    token: USDC_ADDRESS as `0x${string}`,
  });

  return (
    <div className="flex flex-row">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Connected Wallet</CardTitle>
          <CardDescription>
            Manage your connected wallet and chains.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 text-lg font-semibold">Account Details</h4>
            <p className="break-all text-sm text-muted-foreground">
              <span className="font-medium">Address:</span> {address}
            </p>
          </div>

          {currentChain && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <WalletChain chain={currentChain} isCurrent={true} />
                {balance && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Balance:</span>{' '}
                    {balanceIsPending ? (
                      <Loader2
                        className="inline-block animate-spin"
                        size={16}
                      />
                    ) : (
                      balance.formatted
                    )}{' '}
                    {balance.symbol}
                  </p>
                )}
                <p className="mt-1 text-sm">
                  <span className="font-medium">USDC:</span>{' '}
                  {usdcBalanceIsPending ? (
                    <Loader2 className="inline-block animate-spin" size={16} />
                  ) : (
                    usdcBalance?.formatted
                  )}
                  {usdcBalance?.symbol}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Other Available Chains</CardTitle>
          <CardDescription>
            This Chains are available to use with akashic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {chains.filter(({ id }) => id !== currentChain?.id).length > 0 && (
            <div>
              <h4 className="mb-2 text-lg font-semibold"></h4>
              <div className="space-y-3">
                {chains
                  .filter(({ id }) => id !== currentChain?.id)
                  .map((chain) => (
                    <WalletChain key={chain.id} chain={chain} />
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
