'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toHex, stringToHex } from 'viem'

export function CreateCampaign() {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    startTime: '',
    endTime: ''
  })

  const { data: hash, isPending, writeContract } = useWriteContract()

  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const campaignInfoFactory = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!writeContract || !address) {
      console.log('Missing writeContract or address')
      return
    }

    // Generate a unique identifier hash for the campaign
    const identifierHash = keccak256(
      stringToHex(`${address}-${Date.now()}`)
    )

    // Create campaign data structure
    const campaignData = {
      startTime: BigInt(new Date(formData.startTime).getTime() / 1000),
      endTime: BigInt(new Date(formData.endTime).getTime() / 1000),
      fundingGoal: parseEther(formData.fundingGoal || '0'),
    }

    const campaignData2 = {
      launchTime: BigInt(new Date(formData.startTime).getTime() / 1000),
      deadline: BigInt(new Date(formData.endTime).getTime() / 1000),
      goalAmount: parseEther(formData.fundingGoal || '0'),
    }

    const campaignData3 = [
      BigInt(new Date(formData.startTime).getTime() / 1000),
      BigInt(new Date(formData.endTime).getTime() / 1000),
      parseEther(formData.fundingGoal || '0')
    ]

    try {
      const result = await writeContract({
        address: campaignInfoFactory as `0x${string}`,
        abi: CampaignInfoFactoryABI,
        functionName: 'createCampaign',
        args: [
          address,
          identifierHash,
          [(process.env.NEXT_PUBLIC_PLATFORM_HASH) as `0x${string}`],
          [], // Platform data keys
          [], // Platform data values 
          campaignData2
        ]
      })

      console.log('Contract write successful', result)
    } catch (error) {
      console.error('Error writing contract:', error)
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
        disabled={isPending || !writeContract}
        className="w-full"
      >
        {isPending ? 'Creating...' : 'Create Campaign'}
      </Button>

      {isSuccess && (
        <div className="text-green-600 text-center">
          Campaign created successfully!
        </div>
      )}
    </form>
  )
} 