import { ExploreStories } from '@/components/explore-stories'
import CampaignList from '@/components/campaign-list'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ExploreStories />
      <CampaignList />
    </div>
  )
}
