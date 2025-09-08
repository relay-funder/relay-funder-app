import { ExploreStories } from '@/components/explore-stories';
import { Suspense } from 'react';
export default function CampaignsPage() {
  return (
    <Suspense>
      <ExploreStories />
    </Suspense>
  );
}
