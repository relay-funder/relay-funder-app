import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Users, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplyToRound } from "@/components/apply-to-round"
import { MOCK_USER_CAMPAIGNS } from "@/lib/constant"
import { prisma } from "@/lib/prisma"
import type { Round as PrismaRound, Campaign } from "@prisma/client"
import { ROUND_STATUS_MAP, getRoundStatus } from "@/types/round"
import type { RoundStatusKey } from "@/types/round"

interface RoundWithCampaigns extends PrismaRound {
  roundCampaigns: {
    Campaign: Pick<Campaign, "id" | "slug" | "title">
  }[]
}

async function getRoundData(id: string): Promise<RoundWithCampaigns | null> {
  const roundId = parseInt(id, 10)
  if (isNaN(roundId)) {
    return null
  }

  try {
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        roundCampaigns: {
          include: {
            Campaign: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
      },
    })
    return round
  } catch (error) {
    console.error("Failed to fetch round:", error)
    return null
  }
}

const DEFAULT_ROUND_LOGO = "/images/default-round-logo.png"

export default async function RoundPage({ params }: { params: { id: string } }) {
  const round = await getRoundData(params.id)

  if (!round) {
    notFound()
  }

  const roundStatusKey = getRoundStatus(round)
  const roundStatus = ROUND_STATUS_MAP[roundStatusKey]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex flex-col items-start gap-4 mb-4 md:flex-row md:items-center">
          <Image
            src={round.logoUrl || DEFAULT_ROUND_LOGO}
            alt={`${round.title} logo`}
            width={64}
            height={64}
            className="rounded-lg border"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {round.title}
            </h1>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${roundStatus.color}`}
          >
            {roundStatus.text}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <ApplyToRound
            roundId={round.id}
            roundTitle={round.title}
            applicationEndDate={round.applicationClose}
            userCampaigns={MOCK_USER_CAMPAIGNS}
            roundStatusKey={roundStatusKey}
          />
          <Button variant="outline" size="lg">
            Share Round
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About this Round</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{round.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Project Requirements</h4>
                      <p className="text-sm text-muted-foreground">
                        Your project must be open source and align with the
                        round&apos;s goals. Specific requirements may apply.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Team Requirements</h4>
                      <p className="text-sm text-muted-foreground">
                        Teams should demonstrate capability and commitment to
                        their project.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participating Projects</CardTitle>
                  <CardDescription>
                    Projects approved to participate in this funding round.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {round.roundCampaigns?.length > 0 ? (
                    <div className="space-y-3">
                      {round.roundCampaigns.map(({ Campaign: campaign }) => (
                        <Link
                          key={campaign.id}
                          href={`/campaigns/${campaign.slug ?? campaign.id}`}
                          className="block p-4 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <h4 className="font-medium">{campaign.title}</h4>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No projects have been approved for this round yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Round Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Matching Formula</h4>
                    <p className="text-sm text-muted-foreground">
                      This round utilizes a specific matching algorithm (e.g.,
                      Quadratic Funding) to allocate pool funds based on
                      community contributions.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Distribution Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      Matched funds are typically distributed to projects within
                      a set timeframe following the round&apos;s conclusion.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Round Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Matching Pool
                </p>
                <p className="text-2xl font-semibold">
                  {Number(round.matchingPool).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {round.tokenAddress.slice(0, 6)}...{round.tokenAddress.slice(-4)}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Key Dates
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Applications Open</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          round.applicationStart
                        ).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Applications Close</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          round.applicationClose
                        ).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Round Starts</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(round.startDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Round Ends</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(round.endDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Blockchain</p>
                <p className="text-sm">{round.blockchain}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
