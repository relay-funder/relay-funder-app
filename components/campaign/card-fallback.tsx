import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { CampaignItemProps } from '@/types/campaign';
import { CampaignMainImage } from './main-image';
import { CampaignProgress } from './progress';
import { UserInlineName } from '../user/inline-name';
import { CampaignLocation } from './location';
import { useSession } from 'next-auth/react';

export function CampaignCardFallback({
  campaign,
  onCreate,
}: CampaignItemProps) {
  const session = useSession();
  return (
    <Card
      className="flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-lg"
      onClick={onCreate}
    >
      <CardHeader className="relative p-0">
        <CampaignMainImage campaign={campaign} />
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="mb-2 line-clamp-1 text-xl font-bold">
            Create Campaign
          </h2>
        </div>
        <div className="space-y-2">
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="align flex gap-2 self-start">
              <UserInlineName user={session.data?.user} />
            </div>
            <CampaignLocation />
          </div>
          <p className="line-clamp-3 text-[12px] text-gray-600">
            To fund your project, create a campaign now.
          </p>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
        <div className="w-full flex-1 space-y-2 py-4">
          <CampaignProgress />
        </div>
      </CardFooter>
    </Card>
  );
}
