import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  Button,
  Input,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile, useUpdateUserProfile } from '@/lib/hooks/useProfile';

const recipientWalletSchema = z.object({
  recipientWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Please enter a valid Ethereum address.',
    })
    .optional()
    .or(z.literal('')),
});

type RecipientWalletFormValues = z.infer<typeof recipientWalletSchema>;

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

  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { mutateAsync: updateUserProfile, isPending } = useUpdateUserProfile();

  const form = useForm<RecipientWalletFormValues>({
    resolver: zodResolver(recipientWalletSchema),
    defaultValues: {
      recipientWallet: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        recipientWallet: profile.recipientWallet ?? '',
      });
    }
  }, [profile, form]);

  const onSubmit = useCallback(
    async (data: RecipientWalletFormValues) => {
      if (!profile) return;
      try {
        await updateUserProfile({
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          email: profile.email ?? '',
          username: profile.username,
          bio: profile.bio,
          recipientWallet: data.recipientWallet || undefined,
        });
        toast({
          title: 'Recipient Wallet updated',
          description: 'Your recipient wallet has been successfully updated.',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update recipient wallet. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [updateUserProfile, toast, profile],
  );

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
                The blockchain network you&apos;re currently connected to.
              </p>
            </div>
          </div>
        )}

        {/* Recipient Wallet Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900">
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
      </CardContent>
    </Card>
  );
}
