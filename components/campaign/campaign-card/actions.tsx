import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DbCampaign } from '@/types/campaign';
import { CampaignCardAdminActions } from '../card-admin-actions';
import { CampaignCardDisplayOptions } from './types';

interface CampaignStatusInfo {
  status: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  description: string;
  canDonate: boolean;
}

interface CampaignCardActionsProps {
  campaign: DbCampaign;
  showButtons: boolean;
  customButtons?: React.ReactNode;
  adminMode: boolean;
  displayOptions: CampaignCardDisplayOptions;
  canDonate: boolean;
  campaignStatusInfo: CampaignStatusInfo;
}

export function CampaignCardActions({
  campaign,
  showButtons,
  customButtons,
  adminMode,
  displayOptions,
  canDonate,
  campaignStatusInfo,
}: CampaignCardActionsProps) {
  if (!showButtons) return null;

  return (
    <>
      {/* Default action buttons */}
      {!customButtons && (
        <>
          {adminMode && <CampaignCardAdminActions campaign={campaign} />}

          {displayOptions.showDonateButton && (
            <div className="flex w-full flex-row align-middle">
              {canDonate ? (
                <Link
                  href={`/campaigns/${campaign.slug}/donation`}
                  className="flex-1"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Image
                      src="/diamond.png"
                      alt="wallet"
                      width={24}
                      height={24}
                    />
                    Donate
                  </Button>
                </Link>
              ) : displayOptions.showStatusBasedButton ? (
                <Button
                  disabled
                  className="w-full cursor-not-allowed bg-gray-400"
                  title={campaignStatusInfo.description}
                >
                  <Image
                    src="/diamond.png"
                    alt="wallet"
                    width={24}
                    height={24}
                    className="opacity-50"
                  />
                  {campaignStatusInfo.status}
                </Button>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* Custom buttons */}
      {customButtons && (
        <div className="flex w-full flex-row align-middle">{customButtons}</div>
      )}
    </>
  );
}
