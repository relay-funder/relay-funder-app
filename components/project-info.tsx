import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"
import Image from "next/image"
import Link from "next/link"
import { Campaign } from "../types/campaign"

interface ProjectInfoProps {
  campaign: Campaign;
}

export default function ProjectInfo({ campaign }: ProjectInfoProps) {
  const mainImage = campaign.images.find(img => img.isMainImage) || campaign.images[0]

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden w-fit">
        <Image
          src={mainImage ? mainImage.imageUrl : "/placeholder.svg?height=300&width=600"}
          alt={`${campaign.title} illustration`}
          width={600}
          height={300}
          className="object-cover"
        />
      </Card>

      <div className="flex gap-2">
        <Badge className="bg-indigo-600">Verified</Badge>
        {/* <Badge variant="secondary">VOUCHED</Badge> */}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>{campaign.owner.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-semibold text-pink-500">{campaign.title}</h1>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Raised</div>
          <div className="text-2xl font-bold">${parseFloat(campaign.amountRaised || '0').toLocaleString()}</div>
        </div>

        <p className="text-muted-foreground">
          {campaign.description}
        </p>

        <div className="space-y-4 rounded-lg bg-slate-50 p-4">
          <h3 className="font-semibold">100% goes to the project always.</h3>
          <p className="text-muted-foreground">Every donation is peer-to-peer, with no fees and no middlemen.</p>
          <Link href="#" className="text-sm text-pink-500 hover:underline">
            Learn about our zero-fee policy →
          </Link>
        </div>
      </div>
    </div>
  )
}

