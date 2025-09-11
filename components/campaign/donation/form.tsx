import { Card, CardContent } from '@/components/ui';
import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletTab } from '@/components/campaign/donation/wallet/tab';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
export function CampaignDonationForm({ campaign }: { campaign: DbCampaign }) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">How do you want to donate?</h2>
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
      </CardContent>
    </Card>
  );
}
