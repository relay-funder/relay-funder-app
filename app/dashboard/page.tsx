'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { SideBar } from '@/components/SideBar'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Coins, Users, Calendar, TrendingUp } from "lucide-react"

interface Campaign {
    address: string
    owner: string
    launchTime: string
    deadline: string
    goalAmount: string
    totalRaised: string
    isApproved?: boolean
}

export default function DashboardPage() {
    const { address } = useAccount()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isOpen } = useSidebar()

    useEffect(() => {
        const fetchUserCampaigns = async () => {
            if (!address) {
                setError('Please connect your wallet to view your campaigns')
                setLoading(false)
                return
            }

            try {
                const response = await fetch('/api/campaigns')
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch campaigns')
                }

                // Filter campaigns owned by the current user and add approval status
                const userCampaigns = await Promise.all(
                    data.campaigns
                        .filter((campaign: Campaign) =>
                            campaign.owner.toLowerCase() === address.toLowerCase()
                        )
                        .map(async (campaign: Campaign) => {
                            // Check approval status from smart contract - pending
                            const approvalStatus = await fetch(`/api/campaigns/${campaign.address}/approval`)
                            const { isApproved } = await approvalStatus.json()
                            return { ...campaign, isApproved }
                        })
                )
                setCampaigns(userCampaigns)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }
        fetchUserCampaigns()
    }, [address])

    const formatDate = (timestamp: string) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleDateString()
    }

    const getCampaignStatus = (campaign: Campaign) => {
        if (!campaign.isApproved) return 'Pending'

        const now = Math.floor(Date.now() / 1000)
        const launchTime = parseInt(campaign.launchTime)
        const deadline = parseInt(campaign.deadline)

        if (now < launchTime) return 'Upcoming'
        if (now > deadline) return 'Ended'
        return 'Active'
    }

    const calculateStats = (campaigns: Campaign[]) => {
        return {
            totalCampaigns: campaigns.length,
            totalRaised: campaigns.reduce((sum, campaign) => sum + Number(campaign.totalRaised), 0),
            activeCampaigns: campaigns.filter(campaign => {
                const now = Math.floor(Date.now() / 1000)
                const launchTime = parseInt(campaign.launchTime)
                const deadline = parseInt(campaign.deadline)
                return now >= launchTime && now <= deadline
            }).length,
            averageProgress: campaigns.length > 0
                ? campaigns.reduce((sum, campaign) =>
                    sum + (Number(campaign.totalRaised) / Number(campaign.goalAmount)) * 100, 0
                ) / campaigns.length
                : 0
        }
    }

    if (!address) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <SideBar />
                <div className={cn(
                    "flex-1 p-8 transition-all duration-300 ease-in-out",
                    isOpen ? "ml-[240px]" : "ml-[70px]"
                )}>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Please connect your wallet to view your campaigns</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar />
            <div className={cn(
                "flex-1 p-8 transition-all duration-300 ease-in-out",
                isOpen ? "ml-[240px]" : "ml-[70px]"
            )}>
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                    {!loading && !error && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                                        <h3 className="text-2xl font-bold">{calculateStats(campaigns).totalCampaigns}</h3>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                        <Coins className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Raised</p>
                                        <h3 className="text-2xl font-bold">{calculateStats(campaigns).totalRaised.toFixed(2)} ETH</h3>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                                        <h3 className="text-2xl font-bold">{calculateStats(campaigns).activeCampaigns}</h3>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Average Progress</p>
                                        <h3 className="text-2xl font-bold">{calculateStats(campaigns).averageProgress.toFixed(1)}%</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(3)].map((_, index) => (
                                <Card key={index} className="animate-pulse">
                                    <CardHeader className="h-[200px] bg-gray-200" />
                                    <CardContent className="p-6">
                                        <div className="h-6 bg-gray-200 rounded mb-4" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded" />
                                            <div className="h-4 bg-gray-200 rounded" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">You haven&apos;t created any campaigns yet.</p>
                            <Button className="mt-4" onClick={() => window.location.href = '/'}>
                                Create Your First Campaign
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {campaigns.map((campaign) => (
                                <Card key={campaign.address} className="overflow-hidden">
                                    <CardHeader className="p-0">
                                        <Image
                                            src="/images/placeholder.svg"
                                            alt="Campaign"
                                            width={600}
                                            height={400}
                                            className="h-[200px] w-full object-cover"
                                        />
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center">

                                            <h2 className="text-xl font-bold mb-4">Campaign</h2>
                                            <div className={cn(
                                                "top-4 right-4 px-3 py-1 rounded-full text-sm inline-block",
                                                {
                                                    'bg-blue-100 text-blue-600': getCampaignStatus(campaign) === 'Active',
                                                    'bg-yellow-100 text-yellow-600': getCampaignStatus(campaign) === 'Upcoming',
                                                    'bg-gray-100 text-gray-600': getCampaignStatus(campaign) === 'Ended',
                                                    'bg-orange-100 text-orange-600': getCampaignStatus(campaign) === 'Pending'
                                                }
                                            )}>
                                                {getCampaignStatus(campaign)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p><strong>Launch:</strong> {formatDate(campaign.launchTime)}</p>
                                            <p><strong>Deadline:</strong> {formatDate(campaign.deadline)}</p>
                                            <p><strong>Goal:</strong> {campaign.goalAmount} ETH</p>
                                            <p><strong>Raised:</strong> {campaign.totalRaised} ETH</p>
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Progress</span>
                                                    <span>{((Number(campaign.totalRaised) / Number(campaign.goalAmount)) * 100).toFixed(2)}%</span>
                                                </div>
                                                <Progress
                                                    value={(Number(campaign.totalRaised) / Number(campaign.goalAmount)) * 100}
                                                    className="h-2"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
