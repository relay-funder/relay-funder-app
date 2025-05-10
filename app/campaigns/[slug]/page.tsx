import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Mail, Users, Clock, MapPin, Target, Link2 } from 'lucide-react';
import Link from 'next/link';

import {
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from '@/components/ui';
// import { getCampaignBySlug, type PaymentWithUser } from "@/lib/api/campaigns";
import { CampaignImage } from '@prisma/client';
import { CampaignDisplay } from '@/types/campaign';
import { getCampaign } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { CommentForm } from '@/components/comment-form';
import BackButton from '@/components/back-button';
import { CampaignUpdateForm } from '@/components/campaign-update-form';
import { Timeline } from '@/components/timeline';
import ClientRewardsTab from '@/components/client-rewards-tab';
import { ShareCampaignDialog } from '@/components/share-campaign-dialog';
import { FavoriteButton } from '@/components/favorite-button';

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const campaign: CampaignDisplay = await getCampaign((await params).slug);

  if (!campaign) {
    notFound();
  }

  const mainImage =
    campaign.images.find((img: CampaignImage) => img.isMainImage) ||
    campaign.images[0];
  const raisedAmount =
    campaign.payments?.reduce((sum: number, payment) => {
      const amount = Number(payment.amount) || 0;
      return sum + amount;
    }, 0) ?? 0;
  const goalAmount = Number(campaign.fundingGoal) || 0;
  const progress = Math.min((raisedAmount / goalAmount) * 100, 100);

  // Calculate exact days left
  const now = new Date();
  const endDate = new Date(campaign.endTime);
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  console.log('campaign', campaign);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4 pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 py-1">
                <BackButton />
                <Badge variant="secondary" className="px-3 py-1">
                  Featured
                </Badge>
                <span className="text-sm text-gray-500">Technology</span>
              </div>
              <h1 className="pt-2 text-4xl font-bold tracking-tight">
                {campaign.title}
              </h1>

              <div className="flex items-center py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="px-2">
                  <p className="font-medium">
                    {campaign.creatorAddress.slice(0, 6)}...
                    {campaign.creatorAddress.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {campaign.location || 'Location not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="space-y-6">
                <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
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
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-green-600">
                      ${raisedAmount.toLocaleString()}
                    </div>
                    <Progress value={progress} className="h-3 rounded-full" />
                    <p className="text-gray-600">
                      pledged of ${goalAmount.toLocaleString()} goal
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span className="text-2xl font-bold">
                          {campaign.payments?.length || 0}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">backers</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="text-2xl font-bold">{daysLeft}</span>
                      </div>
                      <p className="text-sm text-gray-600">days left</p>
                    </div>
                  </div>

                  <Link href={`/campaigns/${campaign.slug}/donation`}>
                    <Button className="mt-4 h-12 w-full text-lg" size="lg">
                      Back this project
                    </Button>
                  </Link>

                  <div className="flex justify-center gap-2">
                    <FavoriteButton campaignId={campaign.id} />
                    <ShareCampaignDialog
                      campaignTitle={campaign.title}
                      campaignSlug={campaign.slug}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>
                        {campaign.location || 'Location not specified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Target className="h-5 w-5" />
                      <span>
                        Project will be funded on{' '}
                        {new Date(campaign.endTime).toLocaleDateString()}
                      </span>
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
          <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent">
            <TabsTrigger
              value="campaign"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600"
            >
              Campaign
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600"
            >
              Rewards
            </TabsTrigger>
            <TabsTrigger
              value="updates"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600"
            >
              Updates ({campaign.updates?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600"
            >
              Comments ({campaign.comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600"
            >
              Transactions ({campaign.payments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaign" className="mt-6">
            <div className="max-w-3xl">
              <div className="prose prose-lg">
                <h2 className="mb-4 text-2xl font-semibold">
                  About this project
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                  {campaign.description}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid gap-6 md:grid-cols-[60%_40%] lg:grid-cols-[60%_40%]">
              <div className="flex flex-col">
                <ClientRewardsTab
                  campaignId={campaign.id.toString()}
                  campaignSlug={campaign.slug}
                  campaignOwner={campaign.creatorAddress}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
              {campaign.creatorAddress && (
                <div className="mx-auto max-w-3xl">
                  <CampaignUpdateForm
                    creatorAddress={campaign.creatorAddress}
                    onSubmit={async (
                      formData: FormData,
                      userAddress: string,
                    ) => {
                      'use server';

                      try {
                        const title = formData.get('title');
                        const content = formData.get('content');

                        if (
                          !title ||
                          !content ||
                          typeof title !== 'string' ||
                          typeof content !== 'string'
                        ) {
                          throw new Error('Invalid form data');
                        }

                        if (!userAddress) {
                          throw new Error(
                            'Please connect your wallet to post update',
                          );
                        }

                        if (
                          userAddress.toLowerCase() !==
                          campaign.creatorAddress.toLowerCase()
                        ) {
                          throw new Error(
                            'Only the campaign creator can post updates',
                          );
                        }

                        const update = await prisma.campaignUpdate.create({
                          data: {
                            title: title,
                            content: content,
                            campaignId: campaign.id,
                            creatorAddress: userAddress,
                          },
                        });

                        console.log('Created update:', update);
                        revalidatePath(`/campaigns/${campaign.slug}`);
                      } catch (error) {
                        console.error('Failed to create update:', error);
                        throw error instanceof Error
                          ? error
                          : new Error('Failed to create update');
                      }
                    }}
                  />
                </div>
              )}

              {campaign.updates && campaign.updates.length > 0 ? (
                <Timeline
                  items={campaign.updates.map((update) => ({
                    ...update,
                    id: update.id.toString(),
                  }))}
                  className="w-full"
                />
              ) : (
                <div className="mx-auto max-w-3xl">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 py-12 text-center">
                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                      No Updates Yet
                    </h3>
                    <p className="text-gray-500">
                      Check back later for updates on this campaign&apos;s
                      progress.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="max-w-3xl space-y-6">
              <CommentForm
                onSubmit={async (formData: FormData, userAddress: string) => {
                  'use server';
                  const content = formData.get('content') as string;

                  // Double check wallet connection on server side
                  if (!userAddress) {
                    throw new Error('Please connect your wallet to comment');
                  }

                  try {
                    const comment = await prisma.comment.create({
                      data: {
                        content,
                        userAddress,
                        campaignId: campaign.id,
                      },
                    });
                    console.log('comment', comment);
                    revalidatePath(`/campaigns/${campaign.slug}`);
                  } catch (error) {
                    console.error('Failed to create comment:', error);
                    throw new Error('Failed to create comment');
                  }
                }}
              />

              {/* Comments list */}
              <div className="space-y-4">
                {campaign.comments?.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage
                            src={
                              comment?.userAddress
                                ? `https://avatar.vercel.sh/${comment.userAddress}`
                                : 'default_avatar_url'
                            }
                          />
                          <AvatarFallback>
                            {comment?.userAddress
                              ? comment.userAddress.slice(0, 2).toUpperCase()
                              : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              {`${comment?.userAddress ? `${comment.userAddress.slice(0, 6)}...${comment.userAddress.slice(-6)}` : 'Anonymous'}`}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleString(
                                undefined,
                                { dateStyle: 'medium', timeStyle: 'short' },
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-gray-600">
                All donations to this campaign are listed here.
              </p>

              {campaign.payments && campaign.payments.length > 0 ? (
                <div className="space-y-4">
                  {campaign.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${payment.user.address}`}
                          />
                          <AvatarFallback>
                            {payment.isAnonymous
                              ? 'A'
                              : payment.user.address.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {payment.isAnonymous
                              ? 'Anonymous Donor'
                              : `${payment.user.address.slice(0, 6)}...${payment.user.address.slice(-4)}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {payment.amount} {payment.token}
                        </p>
                        {payment.transactionHash && (
                          <a
                            href={`https://alfajores.celoscan.io/tx/${payment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
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
                <div className="py-8 text-center">
                  <p className="mb-4 text-gray-500">
                    No donations yet. Be the first to support this campaign!
                  </p>
                  <Button>Make a Donation</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
