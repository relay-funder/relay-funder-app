import { PropsWithChildren } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback } from 'react';
import { Loader2, Wallet, Link as LinkIcon, DollarSign } from 'lucide-react';
import {
  useCurrentChain,
  useConnectedAccount,
  useAccount,
  useBalance,
} from '@/lib/web3';

import { USD_TOKEN } from '@/lib/constant';
import { WalletChain } from './wallet-chain';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { CopyAddress } from '@/components/copy-text';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useToast } from '@/hooks/use-toast';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useUserProfile, useUpdateUserProfile } from '@/lib/hooks/useProfile';
import { useUsdBalance } from '@/lib/web3/hooks/use-usd-balance';
import { formatAddress } from '@/lib/format-address';
import { cn } from '@/lib/utils';

// TODO: Recipient wallet schema for future feature
// const recipientWalletSchema = z.object({
//   recipientWallet: z
//     .string()
//     .regex(/^0x[a-fA-F0-9]{40}$/, {
//       message: 'Please enter a valid Ethereum address.',
//     })
//     .optional()
//     .or(z.literal('')),
// });

// type RecipientWalletFormValues = z.infer<typeof recipientWalletSchema>;

function LabelLike({
  children,
  className,
}: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium text-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

function InputLike({
  children,
  className,
}: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('rounded-md border border-border bg-muted p-3', className)}
    >
      {children}
    </div>
  );
}

export function ConnectedWalletInfo() {
  const { address } = useAccount();
  const { isEmbedded, openUi } = useConnectedAccount();
  const { data: balance, isPending: balanceIsPending } = useBalance({
    address: address as `0x${string}`,
  });
  const { chain: currentChain } = useCurrentChain();
  const { usdBalance, isPending: usdBalanceIsPending } = useUsdBalance();

  // Profile update functionality removed - this component should only display wallet info
  // const { toast } = useToast();
  // const { data: profile } = useUserProfile();
  // const { mutateAsync: updateUserProfile } = useUpdateUserProfile();

  // TODO: Recipient wallet feature - only handles recipient wallet updates
  // Note: Profile updates should be handled in a separate profile editing component

  // const onSubmit = useCallback(
  //   async (data: { recipientWallet?: string }) => {
  //     if (!profile) return;
  //     try {
  //       await updateUserProfile({
  //         recipientWallet: data.recipientWallet || undefined,
  //       });
  //       toast({
  //         title: 'Recipient Wallet updated',
  //         description: 'Your recipient wallet has been successfully updated.',
  //       });
  //     } catch (error) {
  //       console.error(error);
  //       toast({
  //         title: 'Error',
  //         description:
  //           error instanceof Error
  //             ? error.message
  //             : 'Failed to update recipient wallet. Please try again.',
  //         variant: 'destructive',
  //       });
  //     }
  //   },
  //   [updateUserProfile, toast, profile],
  // );

  const formattedAddress = formatAddress(address ?? '');

  return (
    <Card className="rounded-lg border bg-card shadow-sm">
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
          <h3 className="font-display text-lg font-semibold text-foreground">
            Connected Wallet
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <LabelLike>
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Address
              </LabelLike>
              <div className="flex items-center gap-2">
                <InputLike className="flex-1">
                  <p className="break-all font-mono text-sm text-foreground">
                    {formattedAddress}
                  </p>
                </InputLike>
                <CopyAddress address={address} variant="outline" />
              </div>
              <p className="text-xs text-muted-foreground">
                Your connected wallet address for receiving payments and
                interacting with contracts.
              </p>
            </div>

            {isEmbedded && (
              <div className="space-y-1">
                <Button
                  onClick={openUi}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  Configure Embedded Wallet
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  You are currently using an embedded wallet. Use this button to
                  configure it in the provided user interface.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <LabelLike>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Native Balance
                </LabelLike>
                <InputLike>
                  <p className="text-sm text-foreground">
                    {balanceIsPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        Loading...
                      </span>
                    ) : balance ? (
                      `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                    ) : (
                      '0.0000'
                    )}
                  </p>
                </InputLike>
                <p className="text-xs text-muted-foreground">
                  Your native token balance for transaction fees.
                </p>
              </div>

              <div className="space-y-1">
                <LabelLike>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  USD Token Balance
                </LabelLike>
                <InputLike>
                  <p className="text-sm text-foreground">
                    {usdBalanceIsPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        Loading...
                      </span>
                    ) : usdBalance ? (
                      `${parseFloat(usdBalance).toFixed(2)} ${USD_TOKEN}`
                    ) : (
                      `0.00 ${USD_TOKEN}`
                    )}
                  </p>
                </InputLike>
                <p className="text-xs text-muted-foreground">
                  Your {USD_TOKEN} balance available for contributions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Information Section */}
        {currentChain && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Network Information
            </h3>

            <div className="space-y-1">
              <LabelLike>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                Current Network
              </LabelLike>
              <InputLike>
                <WalletChain chain={currentChain} isCurrent={true} />
              </InputLike>
              <p className="text-xs text-muted-foreground">
                The blockchain network you&apos;re currently connected to.
              </p>
            </div>
          </div>
        )}

        {/* TODO: Future Feature - Recipient Wallet Section */}
        {/* This section allows users to set a custom recipient wallet address for campaign withdrawals */}
        {/* Currently hidden as this feature is planned for future implementation */}
        {/* When implementing: */}
        {/* - Add feature flag control */}
        {/* - Implement proper validation for recipient wallet ownership */}
        {/* - Add confirmation dialogs for address changes */}
        {/* - Ensure proper security measures for fund withdrawal */}
        {/*
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Recipient Wallet Address
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientWallet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Recipient Wallet Address (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} />
                    </FormControl>
                    <FormDescription>
                      For campaign creators: Set the wallet address where you
                      want to receive withdrawn funds from your campaigns. Leave
                      empty to use your connected wallet.
                      <br />
                      <strong>Important:</strong> We cannot verify if this
                      address is under your control. Using an incorrect address
                      may result in funds becoming inaccessible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending || profileLoading}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Recipient Wallet'
                )}
              </Button>
            </form>
          </Form>
        </div>
        */}
      </CardContent>
    </Card>
  );
}
