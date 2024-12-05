'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CampaignInfoFactoryABI } from '@/contracts/abi/CampaignInfoFactory'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

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
    console.log('Form submitted')

    if (!writeContract || !address) {
      console.log('Missing writeContract or address')
      return
    }

    console.log('Preparing to write contract with data:', {
      address: campaignInfoFactory,
      abi: CampaignInfoFactoryABI,
      functionName: 'createCampaign',
      args: [
        address,
        ('0x' + '1'.repeat(64)),
        [('0x' + '2'.repeat(64))],
        [('0x' + '3'.repeat(64))],
        [('0x' + '4'.repeat(64))],
        {
          title: formData.title,
          description: formData.description,
          fundingGoal: parseEther(formData.fundingGoal || '0'),
          startTime: BigInt(new Date(formData.startTime).getTime() / 1000),
          endTime: BigInt(new Date(formData.endTime).getTime() / 1000)
        }
      ]
    })

    try {
      await writeContract({
        address: campaignInfoFactory as `0x${string}`,
        abi: CampaignInfoFactoryABI,
        functionName: 'createCampaign',
        args: [
          address as `0x${string}`,
          ('0x' + '1'.repeat(64)) as `0x${string}`,
          [('0x' + '2'.repeat(64)) as `0x${string}`],
          [('0x' + '3'.repeat(64)) as `0x${string}`],
          [('0x' + '4'.repeat(64)) as `0x${string}`],
          {
            title: formData.title,
            description: formData.description,
            fundingGoal: parseEther(formData.fundingGoal || '0'),
            startTime: BigInt(new Date(formData.startTime).getTime() / 1000),
            endTime: BigInt(new Date(formData.endTime).getTime() / 1000)
          }
        ]
      })
      console.log('Contract write successful')
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