'use client'

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Badge } from "./ui/badge"
import { Switch } from "./ui/switch"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { Alert, AlertDescription } from "./ui/alert"
import { Info, Wallet, HelpCircle } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { Campaign } from "@/types/campaign"

interface DonationFormProps {
  campaign: Campaign;
}

export default function DonationForm({ campaign }: DonationFormProps) {
  const [selectedToken, setSelectedToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [percentage, setPercentage] = useState(10)
  const [isDonatingToAkashic, setIsDonatingToAkashic] = useState(false)
  const [error, ] = useState<string | null>(null)

  // Simulated values - in a real app these would come from an API or wallet
  const tokenPrice = 1 // USD per ETH
  const availableBalance = 0.067484 // ETH
  
  const numericAmount = parseFloat(amount) || 0
  const akashicAmount = isDonatingToAkashic ? (numericAmount * percentage) / 100 : 0
  const poolAmount = numericAmount - akashicAmount

  const formatCrypto = (value: number) => `${value.toFixed(6)} ${selectedToken}`
  const formatUSD = (value: number) => `$ ${(value * tokenPrice).toFixed(2)}`

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="default" className="border-indigo-100 bg-indigo-50">
            <Info className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h2 className="text-lg font-medium">How do you want to donate?</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Save on gas fees, switch network.</span>
          </div>
          <Button variant="link" className="text-pink-500">
            Switch Network
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-teal-50 text-teal-600 hover:bg-teal-50">
            <span className="mr-1">👋</span> Eligible for matching
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="flex rounded-md border shadow-sm">
              <div className="relative flex flex-1">
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="w-[120px] rounded-r-none border-0 bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="CELO">Celo</SelectItem> */}
                    <SelectItem value="USDC">USDC</SelectItem>
                    {/* <SelectItem value="DAI">DAI</SelectItem> */}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-l-none border-0 border-l"
                />
              </div>
              <div className="flex items-center px-3 text-sm text-muted-foreground">
                {formatUSD(numericAmount)}
              </div>
            </div>
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
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Switch
                checked={isDonatingToAkashic}
                onCheckedChange={(checked) => {
                  setIsDonatingToAkashic(checked)
                  // if (checked && !numericAmount) {
                  //   setError('Please enter an amount first')
                  // } else {
                  //   setError(null)
                  // }
                }}
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
                <span className="font-medium">{formatCrypto(akashicAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold">
              <span>Your total donation</span>
              <span>{formatCrypto(numericAmount)}</span>
            </div>
          </div>

          <Button className="w-full" size="lg" disabled={!numericAmount}>
            Donate
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="anonymous" />
              <label htmlFor="anonymous" className="text-sm font-medium">
                Make my donation anonymous
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              By checking this, we won&apos;t consider your profile information as a donor for this donation and won&apos;t show it on public pages.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

