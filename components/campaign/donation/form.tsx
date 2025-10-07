'use client';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletTab } from '@/components/campaign/donation/wallet/tab';
import { DaimoPayTab } from '@/components/campaign/donation/daimo-tab';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Wallet, Zap } from 'lucide-react';
export function CampaignDonationForm({ campaign }: { campaign: DbCampaign }) {
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
      {/* Payment method tabs */}
      <Tabs defaultValue="wallet">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Crypto Wallet
          </TabsTrigger>
          <TabsTrigger value="daimo" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Daimo Pay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <Web3ContextProvider>
            <CampaignDonationWalletTab campaign={campaign} />
          </Web3ContextProvider>
        </TabsContent>

        <TabsContent value="daimo">
          <Web3ContextProvider>
            <DaimoPayTab campaign={campaign} />
          </Web3ContextProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
