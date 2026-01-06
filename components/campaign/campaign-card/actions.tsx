import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DbCampaign } from '@/types/campaign';
import { CampaignCardAdminActions } from '../card-admin-actions';
import { CampaignCardDisplayOptions } from './types';
import { isCampaignStarted } from '@/lib/utils/campaign-status';
import { FormattedDate } from '@/components/formatted-date';

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
                  <Button className="w-full">
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
                  className="w-full cursor-not-allowed"
                  title={campaignStatusInfo.description}
                >
                  <Image
                    src="/diamond.png"
                    alt="wallet"
                    width={24}
                    height={24}
                    className="opacity-50"
                  />
                  {isCampaignStarted(campaign) ? (
                    campaignStatusInfo.status
                  ) : (
                    <>
                      Starts <FormattedDate date={campaign.startTime} />
                    </>
                  )}
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
