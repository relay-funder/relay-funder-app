import { Metadata } from "next";
import RoundCard from "@/components/round-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MOCK_ROUNDS } from "@/lib/constant";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quadratic Funding Rounds | Akashic",
  description: "Explore and participate in quadratic funding rounds",
};


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
