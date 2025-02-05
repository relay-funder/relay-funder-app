import { Metadata } from "next";
import RoundCard from "@/components/round-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Round } from "@/types/round";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quadratic Funding Rounds | Akashic",
  description: "Explore and participate in quadratic funding rounds",
};

const MOCK_ROUNDS: Round[] = [
  {
    id: "dapps-and-apps",
    title: "dApps and Apps",
    description: "This initiative funds innovative dApps & Apps in two areas: 1) User-friendly applications enhancing Web3 accessibility and usability, and 2) Projects advancing financial inclusion, education, and social impact. The goal is to accelerate growth and adoption of the ecosystem.",
    type: "OSS_ROUND",
    category: "Development",
    matchingPool: 300000,
    startDate: "2024-03-01",
    endDate: "2024-04-01",
    status: "ACTIVE",
    organization: {
      name: "Akashic",
      logo: "/akashic-logo.png"
    }
  },
  {
    id: "web3-infrastructure",
    title: "Web3 Infrastructure",
    description: "This round aims to strengthen the Ethereum ecosystem's foundational infrastructure by supporting projects crucial for its development, scalability, and security.",
    type: "OSS_ROUND",
    category: "Infrastructure",
    matchingPool: 300000,
    startDate: "2024-03-01",
    endDate: "2024-04-01",
    status: "ACTIVE",
    organization: {
      name: "Akashic",
      logo: "/akashic-logo.png"
    }
  },
  {
    id: "dev-tooling",
    title: "Dev Tooling",
    description: "This round funds projects enhancing developer tools for OSS and Web3. We support creation of environments, frameworks, and libraries for efficient, secure smart contract development. Goals: reduce barriers, boost efficiency, and show strong community adoption.",
    type: "OSS_ROUND",
    category: "Development",
    matchingPool: 300000,
    startDate: "2024-03-15",
    endDate: "2024-04-15",
    status: "UPCOMING",
    organization: {
      name: "Akashic",
      logo: "/akashic-logo.png"
    }
  }
];

export default function RoundsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Quadratic Funding Rounds</h1>
          <p className="text-gray-600">
            Explore active and upcoming funding rounds to support impactful projects
          </p>
        </div>
        <Link href="/rounds/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Round
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ROUNDS.map((round) => (
          <RoundCard key={round.id} round={round} />
        ))}
      </div>
    </div>
  );
}
