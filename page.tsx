import DonationForm from "./donation-form"
import ProjectInfo from "./project-info"
import { Campaign } from "@/types/campaign"

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
  images: [
    {
      id: 1,
      imageUrl: "/placeholder.svg?height=300&width=600",
      isMainImage: true
    }
  ]
}

export default function Page() {
  return (
    <div className="container mx-auto grid gap-8 p-6 lg:grid-cols-2">
      <DonationForm campaign={mockCampaign} />
      <ProjectInfo campaign={mockCampaign} />
    </div>
  )
}

