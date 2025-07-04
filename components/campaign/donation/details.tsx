'use client';

import { useState } from 'react';
import { Wallet, HelpCircle, CreditCard } from 'lucide-react';
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
import { Campaign } from '@/types/campaign';

export function CampaignDonationDetails({ campaign: Campaign }) {
  const [isDonatingToAkashic, setIsDonatingToAkashic] = useState(false);
  const [percentage, setPercentage] = useState(10);
  const [amount, setAmount] = useState('');
  return (
    <>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-teal-50 text-teal-600 hover:bg-teal-50"
        >
          <span className="mr-1">👋</span> Eligible for matching
        </Badge>
      </div>

      <div className="space-y-4">
        {(!stripeData || paymentMethod === 'wallet') && (
          <div className="relative">
            <div className="flex rounded-md border shadow-sm">
              <div className="relative flex flex-1">
                <Select
                  value={paymentMethod === 'wallet' ? selectedToken : 'USD'}
                  onValueChange={setSelectedToken}
                  disabled={paymentMethod === 'card'}
                >
                  <SelectTrigger className="w-[120px] rounded-r-none border-0 bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethod === 'wallet' ? (
                      <SelectItem value="USDC">USDC</SelectItem>
                    ) : (
                      <SelectItem value="USD">USD</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-l-none border-0 border-l"
                />
              </div>
              {paymentMethod === 'wallet' && (
                <div className="flex items-center px-3 text-sm text-muted-foreground">
                  {formatUSD(numericAmount)}
                </div>
              )}
            </div>
            {paymentMethod === 'wallet' && (
              <div className="mt-1 text-sm text-muted-foreground">
                Available: {availableBalance}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="ml-1 inline h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your available balance in {selectedToken}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        )}

        {showDonationDetails && (
          <>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Switch
                  checked={isDonatingToAkashic}
                  onCheckedChange={setIsDonatingToAkashic}
                />
                <span className="text-sm">Donate to Akashic</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose a percentage to donate to Akashic</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {isDonatingToAkashic && (
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((value) => (
                    <Button
                      key={value}
                      variant={percentage === value ? 'default' : 'outline'}
                      onClick={() => setPercentage(value)}
                      className="flex-1"
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span>Donating to {campaign.title}</span>
                <span className="font-medium">{formatCrypto(poolAmount)}</span>
              </div>
              {isDonatingToAkashic && (
                <div className="flex justify-between text-sm">
                  <span>Donating {percentage}% to Akashic</span>
                  <span className="font-medium">
                    {formatCrypto(akashicAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold">
                <span>Your total donation</span>
                <span>{formatCrypto(numericAmount)}</span>
              </div>
            </div>
          </>
        )}

        {showDonateButton && (
          <Button
            className="w-full"
            size="lg"
            disabled={!numericAmount || isProcessing}
            onClick={paymentMethod === 'wallet' ? onDonate : onStripePayment}
          >
            {isProcessing
              ? 'Processing...'
              : `Donate with ${paymentMethod === 'wallet' ? 'Wallet' : 'Card'}`}
          </Button>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="anonymous" />
            <label htmlFor="anonymous" className="text-sm font-medium">
              Make my donation anonymous
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            By checking this, we won&apos;t consider your profile information as
            a donor for this donation and won&apos;t show it on public pages.
          </p>
        </div>
      </div>
    </>
  );
}
