'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  //TableHeader, 
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { CardFooter } from "@/components/ui/card";
import { IoLocationSharp } from 'react-icons/io5';
import Link from "next/link";


interface Campaign {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
  creatorAddress: string;
  status: string;
  transactionHash: string | null;
  campaignAddress: string;
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  location: string;
  images: {
    id: number;
    imageUrl: string;
    isMainImage: boolean;
  }[];
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();

      console.log("dataapi", data.campaigns[0]);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }
      console.log("Campaigns", data.campaigns.map((campaign: Campaign) => campaign.address));
      setCampaigns(data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.address} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
          <CardHeader className="p-0">
            <Image
              src={campaign.images?.find(img => img.isMainImage)?.imageUrl || '/images/placeholder.svg'}
              alt={campaign.title || campaign.address}
              width={600}
              height={400}
              className="h-[200px] w-full object-cover"
            />
          </CardHeader>
          <CardContent className="p-6">
            <h2 className="mb-2 text-xl font-bold">{campaign.title || 'Campaign Title'}</h2>
            <div className="flex justify-between items-center mb-4 gap-2">
              <div className="flex align self-start">
                <Image
                  src={`https://avatar.vercel.sh/${campaign.address}`}
                  alt="user-pr"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-medium">{`${campaign.owner.slice(0, 10)}...`}</span>
              </div>
              <div className="flex align self-start">
                <IoLocationSharp className='text-[#55DFAB] mt-0.5' />
                <span className="text-gray-900 text-sm">{campaign.location || 'Earth'}</span>
              </div>
            </div>
            <p className="text-gray-600 text-[12px]">{campaign.description}</p>
            <div className="mb-4 items-center text-[14px] gap-2 underline decoration-black text-black">
              Read More
            </div>
          </CardContent>
          
          <div className="mt-auto px-6 py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className='flex '>
                <div className='text-[#55DFAB] px-1 font-bold'>
                  {campaign.totalRaised}
                </div>
                donations
              </span>

              <span className='flex'>
                <div className='text-[#55DFAB] px-1 font-bold'>
                  {((Number(campaign.totalRaised) / Number(campaign.goalAmount)) * 100).toFixed(2)}%
                </div>
                of funding goal
              </span>
            </div>
            <Progress value={(Number(campaign.totalRaised) / Number(campaign.goalAmount)) * 100} className="h-2" />
          </div>

          <CardFooter className="mt-auto gap-4 p-6 pt-0">
            <Link href={`/campaigns/${campaign.address}`} className="flex-1">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Image src="/diamond.png" alt="wallet" width={24} height={24} />
                Donate
              </Button>
            </Link>
            <Button variant="outline" className="flex-1">
              <Image src="/sparkles.png" alt="wallet" width={24} height={24} />
              Add to Collection
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Info className="mr-2 h-4 w-4" />
              </DialogTrigger>
              <DialogContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableCell>{campaign.address}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Owner</TableHead>
                      <TableCell>{campaign.owner}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Launch Time</TableHead>
                      <TableCell>{formatDate(campaign.launchTime)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Deadline</TableHead>
                      <TableCell>{formatDate(campaign.deadline)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Goal Amount</TableHead>
                      <TableCell>{campaign.goalAmount} ETH</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Total Raised</TableHead>
                      <TableCell>{campaign.totalRaised} ETH</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}