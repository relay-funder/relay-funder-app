'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, stringToHex } from 'viem'
import { useToast } from "@/hooks/use-toast"
import { Log } from 'viem'


export function CreateCampaign() {
  const { address } = useAccount()
  const campaignInfoFactory = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;

  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  })

  const { data: hash, isPending, writeContract } = useWriteContract()
  const [campaignId, setCampaignId] = useState<number | null>(null)

  console.log('Current transaction hash:', hash)

  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    const updateCampaign = async () => {
      if (hash && isSuccess && campaignId && receipt) {
        const campaignAddress = receipt.logs[0].address

        try {
          if (receipt.status === 'success') {
            toast({
              title: "Transaction Confirmed",
              description: "Updating campaign status...",
            })

            // First update the campaign status to pending_approval
            const response = await fetch('/api/campaigns/user', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                campaignId,
                transactionHash: hash,
                campaignAddress: campaignAddress,
                status: 'pending_approval',
              }),
            })

            if (!response.ok) {
              const errorData = await response.json(); 
              throw new Error(errorData.error || errorData.error || 'Failed to update campaign status')
            }

            // Then find the event and update campaign address
            const event = receipt.logs.find(
              (log: Log) => log.transactionHash === hash
            );

            console.log('Event:', event)

            if (event) {
              // Get the campaign address from the event topics
              const campaignAddress = event.address;
              
              if (campaignAddress) {
                const addressResponse = await fetch('/api/campaigns/user', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    campaignId,
                    campaignAddress,
                  }),
                });

                if (!addressResponse.ok) {
                  const errorData = await addressResponse.json();
                  console.error('Failed to update campaign address:', errorData);
                }
              }

              toast({
                title: "Success!",
                description: "Campaign created successfully and pending approval.",
                variant: "default",
              })
            }
          }
        } catch (error) {
          console.error('Error processing transaction:', error)
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: error instanceof Error ? error.message : "Campaign remains in draft state. Please try again.",
          })

          // Update campaign status to failed
          await fetch('/api/campaigns/user', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId,
              status: 'failed',
              transactionHash: hash,
            }),
          });
        }
      }
    }

    updateCampaign()
  }, [hash, isSuccess, campaignId, receipt, toast])

  // Also add loading state toasts
  useEffect(() => {
    if (isPending) {
      toast({
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet...",
      })
    }
    if (isConfirming) {
      toast({
        title: "Transaction Confirming",
        description: "Waiting for blockchain confirmation...",
      })
    }
    if (isSuccess && hash) {
      toast({
        title: "Transaction Confirmed",
        description: (
          <div>
            Transaction successful!{" "}
            <a
              href={`https://alfajores.celoscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-600"
            >
              View on Explorer
            </a>
          </div>
        ),
        variant: "default",
      })
    }
  }, [isPending, isConfirming, isSuccess, hash, toast])

  const [dbError, setDbError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDbError(null)

    if (!writeContract || !address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet not connected or contract not available",
      })
      return
    }

    try {
      toast({
        title: "Creating Campaign",
        description: "Saving campaign details to database...",
      })

      // First, save to database with draft status
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          fundingGoal: formData.fundingGoal,
          startTime: formData.startTime,
          endTime: formData.endTime,
          creatorAddress: address,
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save campaign')
      }

      toast({
        title: "Campaign Saved",
        description: "Initiating blockchain transaction...",
      })

      const { campaignId: newCampaignId } = await response.json()
      setCampaignId(newCampaignId)

      const campaignData = {
        launchTime: BigInt(new Date(formData.startTime ?? '').getTime() / 1000),
        deadline: BigInt(new Date(formData.endTime ?? '').getTime() / 1000),
        goalAmount: parseEther(formData.fundingGoal || '0'),
      }

      // Then proceed with blockchain transaction
      const identifierHash = keccak256(stringToHex("KickStarter"))
      await writeContract({
        address: campaignInfoFactory as `0x${string}`,
        abi: CampaignInfoFactoryABI,
        functionName: 'createCampaign',
        args: [
          address,
          identifierHash,
          [(process.env.NEXT_PUBLIC_PLATFORM_HASH) as `0x${string}`],
          [], // Platform data keys
          [], // Platform data values 
          campaignData
        ]
      })

    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create campaign. Your campaign has been saved as draft.",
      })
      setDbError('Failed to create campaign. Your campaign has been saved as draft.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Funding Goal (ETH)</label>
        <Input
          type="number"
          step="0.01"
          value={formData.fundingGoal}
          onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Start Time</label>
        <Input
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">End Time</label>
        <Input
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || isConfirming || !writeContract}
        className="w-full"
      >
        {isPending || isConfirming ? 'Creating...' : 'Create Campaign'}
      </Button>

      {dbError && (
        <div className="text-red-600 text-center">
          {dbError}
        </div>
      )}

      {isSuccess && (
        <div className="text-green-600 text-center">
          Campaign created successfully!
        </div>
      )}
    </form>
  )
} 