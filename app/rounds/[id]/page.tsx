import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Calendar, Users, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Round } from "@/types/round";
import ApplyToRound from "@/components/apply-to-round";

// Mock user campaigns - In production, this would come from your auth context/API
const MOCK_USER_CAMPAIGNS = [
  {
    id: "campaign-1",
    title: "My First Campaign"
  },
  {
    id: "campaign-2",
    title: "Another Campaign"
  }
];

// Import mock data from the main rounds page
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

const getRound = (id: string): Round | null => {
  const round = MOCK_ROUNDS.find((r: Round) => r.id === id);
  if (!round) return null;
  return round;
};

interface RoundPageProps {
  params: {
    id: string;
  };
}

export default function RoundPage({ params }: RoundPageProps) {
  const round = getRound(params.id);

  if (!round) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={round.organization.logo}
            alt={round.organization.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h1 className="text-4xl font-bold">{round.title}</h1>
            <p className="text-gray-600">{round.organization.name}</p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <ApplyToRound round={round} userCampaigns={MOCK_USER_CAMPAIGNS} />
          <Button variant="outline" size="lg">
            Share Round
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About this Round</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{round.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 mt-0.5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Project Requirements</h4>
                      <p className="text-gray-600">Your project must be open source and align with the round's goals.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 mt-0.5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Team Requirements</h4>
                      <p className="text-gray-600">Teams must have a proven track record or strong potential in the space.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Participating Projects</CardTitle>
                  <CardDescription>Projects that have been accepted into this round</CardDescription>
                </CardHeader>
                <CardContent>
                  {round.campaigns?.length ? (
                    <div className="space-y-4">
                      {round.campaigns.map((campaignId: string) => (
                        <Link key={campaignId} href={`/campaigns/${campaignId}`}>
                          <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
                            Campaign {campaignId}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No projects have joined this round yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules">
              <Card>
                <CardHeader>
                  <CardTitle>Round Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Matching Formula</h4>
                    <p className="text-gray-600">
                      This round uses quadratic funding to determine matching amounts. The more individual contributors a project has, the higher their matching amount will be.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Distribution</h4>
                    <p className="text-gray-600">
                      Funds will be distributed within 2 weeks after the round ends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Round Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Matching Pool</p>
                <p className="text-2xl font-bold">{round.matchingPool.toLocaleString()} USDC</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  round.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  round.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {round.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Important Dates</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(round.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(round.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 