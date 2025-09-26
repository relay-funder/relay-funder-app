import { Loader2, Wallet, Link as LinkIcon, DollarSign } from 'lucide-react';
import { useCurrentChain, useAccount, useBalance } from '@/lib/web3';
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
  const { chain: currentChain } = useCurrentChain();
  const { data: usdcBalance, isPending: usdcBalanceIsPending } = useBalance({
    address: address as `0x${string}`,
    token: USDC_ADDRESS as `0x${string}`,
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Wallet Details Card */}
      <Card className="rounded-lg border bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connected Wallet
          </CardTitle>
          <CardDescription>
            Your connected wallet address and account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LinkIcon className="h-4 w-4" />
              <span className="font-medium">Address:</span>
            </div>
            <p className="break-all rounded bg-gray-50 p-2 font-mono text-sm">
              {address}
            </p>
          </div>

          {balance && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Native Balance:</span>
              </div>
              <p className="text-sm">
                {balanceIsPending ? (
                  <Loader2 className="inline-block animate-spin" size={16} />
                ) : (
                  `${balance.formatted} ${balance.symbol}`
                )}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">USDC Balance:</span>
            </div>
            <p className="text-sm">
              {usdcBalanceIsPending ? (
                <Loader2 className="inline-block animate-spin" size={16} />
              ) : (
                `${usdcBalance?.formatted || '0'} ${usdcBalance?.symbol || 'USDC'}`
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chain Information Card */}
      {currentChain && (
        <Card className="rounded-lg border bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Current Network
            </CardTitle>
            <CardDescription>
              The blockchain network you&apos;re currently connected to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletChain chain={currentChain} isCurrent={true} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
