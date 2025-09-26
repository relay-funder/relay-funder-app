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
    <Card className="rounded-lg border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Settings
        </CardTitle>
        <CardDescription>
          View your connected wallet information, balances, and network details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Wallet Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Connected Wallet
          </h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Wallet className="h-4 w-4" />
                Address
              </label>
              <div className="mt-1 rounded-md border bg-gray-50 p-3">
                <p className="break-all font-mono text-sm text-gray-700">
                  {address}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Your connected wallet address for receiving payments and
                interacting with contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <DollarSign className="h-4 w-4" />
                  Native Balance
                </label>
                <div className="mt-1 rounded-md border bg-gray-50 p-3">
                  <p className="text-sm text-gray-700">
                    {balanceIsPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : balance ? (
                      `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                    ) : (
                      '0.0000'
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Your native token balance for transaction fees.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <DollarSign className="h-4 w-4" />
                  USDC Balance
                </label>
                <div className="mt-1 rounded-md border bg-gray-50 p-3">
                  <p className="text-sm text-gray-700">
                    {usdcBalanceIsPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : usdcBalance ? (
                      `${parseFloat(usdcBalance.formatted).toFixed(2)} USDC`
                    ) : (
                      '0.00 USDC'
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Your USDC balance available for contributions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Information Section */}
        {currentChain && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Network Information
            </h3>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <LinkIcon className="h-4 w-4" />
                Current Network
              </label>
              <div className="mt-1 rounded-md border bg-gray-50 p-3">
                <WalletChain chain={currentChain} isCurrent={true} />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                The blockchain network you're currently connected to.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
