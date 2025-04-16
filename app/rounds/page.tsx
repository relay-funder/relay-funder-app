// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';

import RoundCard from "@/components/round-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Round } from "@/types/round";

async function getRounds(): Promise<Round[]> {
  try {
    const roundsData = await prisma.round.findMany({
      orderBy: {
        startDate: "desc",
      },
      include: {
        _count: {
          select: { roundCampaigns: true },
        },
      },
    });

    return roundsData.map((round) => ({
      ...round,
      matchingPool: round.matchingPool.toNumber(),
      roundCampaigns: [],
      _count: round._count,
    })) as Round[];
  } catch (error) {
    console.error("Failed to fetch rounds:", error);
    return [];
  }
}

export default async function RoundsPage() {
  const rounds = await getRounds();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Funding Rounds
          </h1>
          <p className="text-muted-foreground">
            Explore active and upcoming funding rounds.
          </p>
        </div>
        <Link href="/rounds/create" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Round
          </Button>
        </Link>
      </div>
      {rounds.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          No funding rounds found.
          <Link href="/rounds/create" className="ml-2 text-primary underline">
            Create the first one!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      )}
    </div>
  );
}
