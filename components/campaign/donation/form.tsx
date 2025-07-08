import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { Wallet, CreditCard } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { CampaignDonationWalletTab } from '@/components/campaign/donation/wallet/tab';
import { CampaignDonationCreditCardTab } from '@/components/campaign/donation/credit-card/tab';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
export function CampaignDonationForm({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">How do you want to donate?</h2>
        </div>
        <Tabs defaultValue="wallet">
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
            <Web3ContextProvider>
              <CampaignDonationWalletTab campaign={campaign} />
            </Web3ContextProvider>
          </TabsContent>

          <TabsContent value="card">
            <CampaignDonationCreditCardTab campaign={campaign} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
