import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import DonationForm from "@/components/donation-form"
import ProjectInfo from "@/components/project-info";
import { Campaign } from "../../../types/campaign"
import BackButton from '@/app/components/back-button'

// This is a mock campaign object. In a real application, you would fetch this data from an API.
const mockCampaign: Campaign = {
  id: 1,
  title: "Save the Rainforest",
  description: "Help us protect and restore the Amazon rainforest. Your donation will go towards conservation efforts and supporting local communities.",
  fundingGoal: "100000",
  startTime: new Date("2023-01-01"),
  endTime: new Date("2023-12-31"),
  creatorAddress: "0x1234567890123456789012345678901234567890",
  status: "active",
  transactionHash: null,
  campaignAddress: "0x0987654321098765432109876543210987654321",
  address: "0x0987654321098765432109876543210987654321",
  owner: "0x1234567890123456789012345678901234567890",
  launchTime: "2023-01-01T00:00:00Z",
  deadline: "2023-12-31T23:59:59Z",
  goalAmount: "100000",
  totalRaised: "75000",
  amountRaised: "75000",
  location: "Amazon Rainforest",
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  images: [
    {
      id: 1,
      imageUrl: "/placeholder.svg?height=300&width=600",
      isMainImage: true,
      campaignId: 1
    }
  ]
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="sticky top-0 z-10 border-b bg-white">
        <header className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <div className="text-sm text-muted-foreground">Donating to</div>
              <h1 className="text-lg font-semibold">{mockCampaign.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">James Farrell</div>
              <div className="text-sm text-muted-foreground">Connected to Ethereum</div>
            </div>
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="James Farrell" />
              <AvatarFallback>JF</AvatarFallback>
            </Avatar>
          </div>
        </header>
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <DonationForm campaign={mockCampaign} />
          <ProjectInfo campaign={mockCampaign} />
        </div>
      </main>
    </div>
  )
}

