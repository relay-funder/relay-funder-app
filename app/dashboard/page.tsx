'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SideBar } from '@/components/SideBar'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Coins, Users, Calendar, TrendingUp } from "lucide-react"
import { Campaign } from '@/types/campaign'
import CampaignCard from '@/components/campaign-card'

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
                console.log('Fetching campaigns for address:', address);
                const response = await fetch(`/api/campaigns/user?address=${address}`)
                const data = await response.json()

                console.log('API Response:', data);

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch campaigns')
                }

                setCampaigns(data.campaigns)
            } catch (err) {
                console.error('Error fetching campaigns:', err);
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }
        fetchUserCampaigns()
    }, [address])

    const calculateStats = (campaigns: Campaign[]) => {
        return {
            totalCampaigns: campaigns.length,
            totalRaised: campaigns.reduce((sum, campaign) => {
                const raised = campaign.totalRaised ? Number(campaign.totalRaised) : 0
                return sum + raised
            }, 0),
            activeCampaigns: campaigns.filter(campaign => {
                const now = Math.floor(Date.now() / 1000)
                const launchTime = campaign.launchTime ? parseInt(campaign.launchTime) : now
                const deadline = campaign.deadline ? parseInt(campaign.deadline) : now
                return now >= launchTime && now <= deadline && campaign.status === 'active'
            }).length,
            averageProgress: campaigns.length > 0
                ? campaigns.reduce((sum, campaign) => {
                    if (!campaign.totalRaised || !campaign.goalAmount) return sum
                    const progress = (Number(campaign.totalRaised) / Number(campaign.goalAmount)) * 100
                    return sum + (isNaN(progress) ? 0 : progress)
                }, 0) / campaigns.length
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
                    <div className="max-w-7xl mx-auto">
                        <div className="text-3xl font-bold mb-8">Dashboard</div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 animate-pulse">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                                        <div className="h-8 bg-gray-200 rounded mt-1 animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 animate-pulse">
                                        <Coins className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-600">Total Raised</p>
                                        <div className="h-8 bg-gray-200 rounded mt-1 animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 animate-pulse">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                                        <div className="h-8 bg-gray-200 rounded mt-1 animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4 animate-pulse">
                                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-600">Average Progress</p>
                                        <div className="h-8 bg-gray-200 rounded mt-1 animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Login to your account</h3>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    Please connect your wallet to view your campaign dashboard and manage your fundraising activities.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <div className="max-w-7xl mx-auto p-5">
                <div className="text-3xl font-bold mb-8 pt-5">Dashboard</div>

                {!loading && !error && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                                    <h3 className="text-2xl font-bold">{calculateStats(campaigns).totalRaised.toFixed(2)} USDC</h3>
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
                                <CardHeader className="p-0 h-[200px] bg-gray-200" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaigns?.map((campaign: Campaign) => (
                            <CampaignCard key={campaign.address} campaign={campaign} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
