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
      <div className="space-y-4">
        {!stripeData && (
          <div className="relative">
            <div className="flex rounded-md border shadow-sm">
              <div className="relative flex flex-1">
                <Select
                  value={'USD'}
                  onValueChange={setSelectedToken}
                  disabled={true}
                >
                  <SelectTrigger className="w-[120px] rounded-r-none border-0 bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-l-none border-0 border-l"
                />
              </div>
            </div>
          </div>
        )}
        {showDonateButton && (
          <Button
            className="w-full"
            size="lg"
            disabled={!numericAmount || isProcessing}
            onClick={onStripePayment}
          >
            {isProcessing ? 'Processing...' : `Donate with Card`}
          </Button>
        )}
      </div>
    </>
  );
}
