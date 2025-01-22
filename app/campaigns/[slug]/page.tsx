import { notFound } from "next/navigation";
import Image from "next/image";
import { Share2, Mail, Heart, Users, Clock, MapPin, Target, Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
// import { getCampaignBySlug, type PaymentWithUser } from "@/lib/api/campaigns";
import { CampaignImage } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CampaignDisplay } from "@/types/campaign";
import { getCampaign } from "@/lib/database";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const campaign:CampaignDisplay = await getCampaign((await params).slug)

  if (!campaign) {
    notFound();
  }

  const mainImage = campaign.images.find((img: CampaignImage) => img.isMainImage) || campaign.images[0];
  const raisedAmount = campaign.payments?.reduce((sum: number, payment) => sum + parseFloat(payment.amount), 0) || 0;
  const goalAmount = parseFloat(campaign.fundingGoal);
  const progress = Math.min((raisedAmount / goalAmount) * 100, 100);

  // Calculate exact days left
  const now = new Date();
  const endDate = new Date(campaign.endTime);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  Featured
                </Badge>
                <span className="text-sm text-gray-500">Technology</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{campaign.title}</h1>
            </div>

          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="space-y-6">

                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium">{campaign.creatorAddress.slice(0, 6)}...{campaign.creatorAddress.slice(-4)}</p>
                    <p className="text-sm text-gray-500">{campaign.location || 'Location not specified'}</p>
                  </div>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                  {mainImage && (
                    <Image
                      src={mainImage.imageUrl}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Card className="sticky top-8">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-green-600">
                      ${raisedAmount.toLocaleString()}
                    </div>
                    <Progress value={progress} className="h-3 rounded-full" />
                    <p className="text-gray-600">pledged of ${goalAmount.toLocaleString()} goal</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span className="text-2xl font-bold">{campaign.payments?.length || 0}</span>
                      </div>
                      <p className="text-gray-600 text-sm">backers</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="text-2xl font-bold">{daysLeft}</span>
                      </div>
                      <p className="text-gray-600 text-sm">days left</p>
                    </div>
                  </div>

                  <Link href={`/campaigns/${campaign.slug}/donation`}>
                    <Button className="w-full mt-4 h-12 text-lg" size="lg">
                      Back this project
                    </Button>
                  </Link>

                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{campaign.location || "Location not specified"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Target className="h-5 w-5" />
                      <span>Project will be funded on {new Date(campaign.endTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="campaign" className="space-y-8">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent">
            <TabsTrigger value="campaign" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Campaign
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Rewards
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Updates
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Comments
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaign" className="mt-6">
            <div className="max-w-3xl">
              <div className="prose prose-lg">
                <h2 className="text-2xl font-semibold mb-4">About this project</h2>
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {campaign.description}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Early Bird Backer NFT</h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">$25</p>
                  <p className="text-gray-600 mb-4">Get early access to our product with exclusive benefits.</p>
                  <Button className="w-full">Select Reward</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="updates">
            <div className="max-w-3xl space-y-8">
              {/* Add updates here */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-2">Posted 3 days ago</p>
                  <h3 className="text-xl font-semibold mb-4">Project Milestone Reached!</h3>
                  <p className="text-gray-700">We&apos;re excited to announce our latest progress...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="max-w-3xl space-y-6">
              {/* Add comments here */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">John Doe</h4>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-700 mt-2">This project looks amazing! Can&apos;t wait to see the final product.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-gray-600">All donations to this campaign are listed here.</p>

              {campaign.payments && campaign.payments.length > 0 ? (
                <div className="space-y-4">
                  {campaign.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${payment.user.address}`} />
                          <AvatarFallback>{payment.isAnonymous ? 'A' : payment.user.address.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {payment.isAnonymous ? 'Anonymous Donor' : `${payment.user.address.slice(0, 6)}...${payment.user.address.slice(-4)}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payment.amount} {payment.token}</p>
                        {payment.transactionHash && (
                          <a
                            href={`https://alfajores.celoscan.io/tx/${payment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Link2 className="h-3 w-3" />
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No donations yet. Be the first to support this campaign!</p>
                  <Button>Make a Donation</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}

