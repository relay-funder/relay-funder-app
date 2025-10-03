'use client';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletTab } from '@/components/campaign/donation/wallet/tab';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
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
      {/* Single treasury mode: Only crypto wallet donations supported */}
      {/* Credit card functionality commented out for MVP - single treasury focus */}
      {/* <Tabs defaultValue="card">
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

          <TabsContent value="card">
            <CampaignDonationCreditCardTab campaign={campaign} />
          </TabsContent>
        </Tabs> */}

      {/* Crypto wallet donation only */}
      <Web3ContextProvider>
        <CampaignDonationWalletTab campaign={campaign} />
      </Web3ContextProvider>
    </div>
  );
}
