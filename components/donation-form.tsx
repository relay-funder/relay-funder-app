'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  SelectValue,
  Badge,
  Switch,
  Input,
  Checkbox,
} from '@/components/ui';
import { ErrorAlert } from '@/components/error-alert';
import { Wallet, HelpCircle, CreditCard } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { useStripePaymentCallback } from '@/hooks/use-stripe';
//import { useNetworkCheck } from '@/hooks/use-network';
import { useDonationCallback } from '@/hooks/use-donation';
import { CampaignDonationTabWallet } from './campaign/donation/wallet/tab';
import { CampaignDonationTabCreditCard } from './campaign/donation/tab-credit-card';
//import { useUsdcBalance } from '@/lib/web3/hooks/use-usdc-balance';

interface DonationFormProps {
  campaign: Campaign;
}

export default function DonationForm({ campaign }: DonationFormProps) {
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [isDonatingToAkashic, setIsDonatingToAkashic] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('card');
  // Simulated values - in a real app these would come from an API or wallet
  const tokenPrice = 1; // USD per USDC

  const numericAmount = parseFloat(amount) || 0;
  const akashicAmount = isDonatingToAkashic
    ? (numericAmount * percentage) / 100
    : 0;
  const poolAmount = numericAmount - akashicAmount;

  //const { isCorrectNetwork } = useNetworkCheck();
  const isCorrectNetwork = true;
  const {
    onDonate,
    isProcessing: isDonateProcessing,
    error: donateError,
  } = useDonationCallback({
    campaign,
    amount,
    selectedToken,
  });
  const {
    onStripePayment,
    error: stripeError,
    isProcessing: isStripeProcessing,
    stripeData,
    stripePromise,
  } = useStripePaymentCallback({
    amount,
  });
  const isProcessing = isStripeProcessing || isDonateProcessing;
  // const handleStripeConfirmation = async () => {
  //   if (!stripeData) return;

  //   try {
  //     const stripe = await loadStripe(stripeData.publicKey);
  //     if (!stripe) throw new Error('Failed to load Stripe');

  //     const { error } = await stripe.confirmPayment({
  //       elements: stripe.elements({
  //         clientSecret: stripeData.clientSecret,
  //         appearance: {
  //           theme: 'stripe'
  //         }
  //       }),
  //       confirmParams: {
  //         return_url: `${window.location.origin}/payment/success`,
  //       }
  //     });

  //     if (error) throw error;

  //     toast({
  //       title: "Success!",
  //       description: "Your card payment has been processed",
  //     });

  //   } catch (err) {
  //     console.error('Stripe confirmation error:', err);
  //     setError(err instanceof Error ? err.message : "Failed to confirm card payment");
  //   }
  // };

  // useEffect(() => {
  //   if (stripeData) {
  //     handleStripeConfirmation();
  //   }
  // }, [stripeData]);

  const showDonationDetails = paymentMethod === 'wallet' || !stripeData;
  const showDonateButton = paymentMethod === 'wallet' || !stripeData;

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-4">
        <ErrorAlert error={donateError} />
        <ErrorAlert error={stripeError} />

        <div className="space-y-2">
          <h2 className="text-lg font-medium">How do you want to donate?</h2>
        </div>

        <Tabs
          defaultValue="card"
          onValueChange={(value) => {
            setPaymentMethod(value as 'wallet' | 'card');
            setSelectedToken(value === 'wallet' ? 'USDC' : 'USD');
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Card
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Crypto Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet">
            <CampaignDonationTabWallet campaign={campaign} />
          </TabsContent>

          <TabsContent value="card">
            <CampaignDonationTabCreditCard
              campaign={campaign}
              amount={amount}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
