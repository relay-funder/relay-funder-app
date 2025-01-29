import DonationForm from "@/components/donation-form"
import ProjectInfo from "@/components/project-info";
import { Campaign } from "@/types/campaign"
import BackButton from '@/app/components/back-button'
import { getCampaign } from "@/lib/database"

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const campaign: Campaign = await getCampaign((await params).slug)

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="sticky top-0 z-10">
                <header className="container mx-auto flex items-center justify-between p-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <div className="text-sm text-muted-foreground">Donating to</div>
                            <h1 className="text-lg font-semibold">{campaign.title}</h1>
                        </div>
                    </div>
                </header>
            </div>
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    <DonationForm campaign={campaign} />
                    <ProjectInfo campaign={campaign} />
                </div>
            </main>
        </div>
    )
}

