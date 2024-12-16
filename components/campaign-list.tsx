'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Campaign {
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }
      
      setCampaigns(data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
        <Card key={campaign.address} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-2">View Details</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Campaign Information</DialogTitle>
                  <DialogDescription>
                    Detailed information about the campaign
                  </DialogDescription>
                </DialogHeader>
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
            <div className="space-y-2">
              <p className="text-sm"><strong>Launch:</strong> {formatDate(campaign.launchTime)}</p>
              <p className="text-sm"><strong>Deadline:</strong> {formatDate(campaign.deadline)}</p>
              <p className="text-sm"><strong>Goal:</strong> {campaign.goalAmount} ETH</p>
              <p className="text-sm"><strong>Raised:</strong> {campaign.totalRaised} ETH</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}