'use client';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletTab } from '@/components/campaign/donation/wallet/tab';
import { DaimoPayTab } from '@/components/campaign/donation/daimo-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Wallet, Zap } from 'lucide-react';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui';
import { usePaymentTabsVisibility } from '@/hooks/use-payment-tabs-visibility';

export function CampaignDonationForm({ campaign }: { campaign: DbCampaign }) {
  const { authenticated, login } = useAuth();
  const { showDaimoPay, showCryptoWallet, defaultTab } =
    usePaymentTabsVisibility();

  // Require wallet authentication before showing payment options
  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center space-x-2">
          <Wallet className="text-muted-foreground" />
          <span className="font-display text-base font-semibold text-foreground">
            You need to connect your wallet to contribute
          </span>
        </div>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          To track your payments and the projects you support, connect your
          wallet. It&apos;s free and easy, and no additional personal data is
          required to contribute.
        </p>
        <div className="flex items-center justify-center">
          <Button onClick={login}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  // Show payment method selection after authentication
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Contribute to Campaign
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Support this campaign with your contribution
        </p>
      </div>

      {/* Payment method tabs - conditionally render based on feature flag */}
      {showDaimoPay && showCryptoWallet ? (
        // Both payment methods enabled - show tabs
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="daimo" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Pay Cross-chain
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Pay Direct
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daimo">
            <DaimoPayTab campaign={campaign} />
          </TabsContent>

          <TabsContent value="wallet">
            <CampaignDonationWalletTab campaign={campaign} />
          </TabsContent>
        </Tabs>
      ) : showDaimoPay ? (
        // Only Daimo Pay enabled - show directly without tabs
        <DaimoPayTab campaign={campaign} />
      ) : showCryptoWallet ? (
        // Only Crypto Wallet enabled - show directly without tabs
        <CampaignDonationWalletTab campaign={campaign} />
      ) : (
        // No payment methods enabled - this shouldn't happen but fallback to Daimo Pay
        <DaimoPayTab campaign={campaign} />
      )}
    </div>
  );
}
