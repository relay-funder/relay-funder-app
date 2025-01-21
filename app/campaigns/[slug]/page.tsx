import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Share2, Mail, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCampaignBySlug } from "@/lib/api/campaigns";
import { CampaignImage, Payment } from "@prisma/client";

interface CampaignPageProps {
  params: {
    slug: string;
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) {
    notFound();
  }

  const mainImage = campaign.images.find((img: CampaignImage) => img.isMainImage) || campaign.images[0];
  const raisedAmount = campaign.payments.reduce((sum: number, payment: Payment) => sum + parseFloat(payment.amount), 0);
  const goalAmount = parseFloat(campaign.fundingGoal);
  const progress = Math.min((raisedAmount / goalAmount) * 100, 100);
  const daysToGo = formatDistanceToNow(campaign.endTime, { addSuffix: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-6">{campaign.title}</h1>
          
          <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
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

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">About this project</h2>
            <p className="whitespace-pre-wrap">{campaign.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6 bg-white rounded-lg p-6 shadow-sm">
            <div>
              <div className="text-3xl font-bold text-green-600">
                ${raisedAmount.toLocaleString()}
              </div>
              <p className="text-gray-600">pledged of ${goalAmount.toLocaleString()} goal</p>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{campaign.payments.length}</div>
                <p className="text-gray-600">backers</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{daysToGo}</div>
                <p className="text-gray-600">days to go</p>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Back this project
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Code className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium">Location</p>
              <p>{campaign.location || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

