'use client';

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAkashicRegistry } from '@/hooks/useAkashicRegistry';
import Link from 'next/link';

export default function TestCampaigns() {
    const { activeCampaigns, isLoadingCampaigns, refetchCampaigns } = useAkashicRegistry();
    const [campaignDetails, setCampaignDetails] = useState<any[]>([]); 
    const [isLoading, setIsLoading] = useState(true);

    // Load campaign details when active campaigns change
    useEffect(() => {
        const loadCampaignDetails = async () => {
            if (!activeCampaigns || activeCampaigns.length === 0) {
                setCampaignDetails([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const details = await Promise.all(
                activeCampaigns.map(async (campaignId: string) => {
                    const { data } = useAkashicRegistry().useCampaignDetails(campaignId);
                    return data;
                })
            );
            
            setCampaignDetails(details.filter(Boolean));
            setIsLoading(false);
        };

        loadCampaignDetails();
    }, [activeCampaigns]);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Test Campaigns</h1>
            
            <div className="mb-6 flex justify-between items-center">
                <Button onClick={() => refetchCampaigns()}>
                    Refresh Campaigns
                </Button>
                
                <Link href="/upload">
                    <Button variant="outline">
                        Upload New Image
                    </Button>
                </Link>
            </div>
            
            {isLoading || isLoadingCampaigns ? (
                <div className="text-center p-8">Loading campaigns...</div>
            ) : !activeCampaigns || activeCampaigns.length === 0 ? (
                <Card className="p-6 text-center">
                    <p className="mb-4">No active campaigns found.</p>
                    <p>You need to create a campaign first using the Akashic NFT Registry contract.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaignDetails.map((campaign, index) => (
                        <Card key={index} className="p-6">
                            <h2 className="text-xl font-bold mb-2">{campaign?.campaignName || `Campaign ${campaign?.campaignId}`}</h2>
                            <p className="mb-1">ID: {campaign?.campaignId}</p>
                            <p className="mb-1">Contract: {campaign?.nftContract}</p>
                            <p className="mb-1">Owner: {campaign?.campaignOwner}</p>
                            <p className="mb-1">Total Minted: {campaign?.totalMinted?.toString() || '0'}</p>
                            <p className="mb-4">Status: {campaign?.isActive ? 'Active' : 'Inactive'}</p>
                            
                            <Link href={`/campaign/${campaign?.campaignId}`}>
                                <Button className="w-full">
                                    View Campaign
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 