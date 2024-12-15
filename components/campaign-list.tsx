'use client'

import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatEther } from 'viem'

type Campaign = {
  identifierHash: `0x${string}`
  campaignInfoAddress: `0x${string}`
  creator: `0x${string}`
}

type CampaignDetails = {
  title: string
  description: string
  fundingGoal: bigint
  startTime: bigint
  endTime: bigint
}

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch('/api/campaigns')
        console.log("response:", response)
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns')
        }
        const data = await response.json()
        console.log("data:", data)
        setCampaigns(data.campaigns)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
        setError('Failed to load campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  if (loading) {
    return <div className="text-center p-6">Loading campaigns...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 p-6">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.identifierHash}
          campaignAddress={campaign.campaignInfoAddress}
        />
      ))}
    </div>
  )
}

function CampaignCard({ campaignAddress }: { campaignAddress: `0x${string}` }) {
  const { data: campaignInfo } = useReadContract({
    address: campaignAddress,
    abi: CampaignInfoABI,
    functionName: 'getCampaignInfo'
  })

  if (!campaignInfo) return null

  const info = campaignInfo as CampaignDetails
  const startDate = new Date(Number(info.startTime) * 1000)
  const endDate = new Date(Number(info.endTime) * 1000)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{info.title}</CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Goal: {formatEther(info.fundingGoal)} ETH</p>
          <p>Start: {startDate.toLocaleDateString()}</p>
          <p>End: {endDate.toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
} 