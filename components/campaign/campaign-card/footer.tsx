import { CardFooter } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { FormattedDate } from '../../formatted-date';
import { CampaignProgress } from '../progress';
import { TreasuryBalanceCompact } from '../treasury-balance';
import { CopyText } from '@/components/copy-text';
import { CampaignCardDisplayOptions } from './types';
import { CampaignCardActions } from './actions';

interface CampaignCardFooterProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  adminMode: boolean;
  showButtons: boolean;
  customButtons?: React.ReactNode;
  canDonate: boolean;
  campaignStatusInfo: any;
}

export function CampaignCardFooter({
  campaign,
  displayOptions,
  adminMode,
  showButtons,
  customButtons,
  canDonate,
  campaignStatusInfo,
}: CampaignCardFooterProps) {
  return (
    <CardFooter className="mt-auto p-6 pt-0">
      <div className="w-full space-y-4">
        {/* Admin-specific info */}
        {adminMode && campaign?.rounds && campaign?.rounds?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Active Rounds:
            </h4>
            <ul className="space-y-1">
              {campaign.rounds.map((round: any) => (
                <li
                  key={round.id}
                  className="border-l-2 border-blue-200 pl-2 text-sm text-gray-600"
                >
                  {round.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Date information for admin */}
        {displayOptions.showDates && adminMode && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {campaign.startTime && (
              <div>
                <span className="text-gray-500">Launch:</span>
                <br />
                <FormattedDate date={campaign.startTime} />
              </div>
            )}
            {campaign.endTime && (
              <div>
                <span className="text-gray-500">Deadline:</span>
                <br />
                <FormattedDate date={campaign.endTime} />
              </div>
            )}
          </div>
        )}

        {/* Progress Bar - Always prominent */}
        <div className="space-y-2">
          <CampaignProgress campaign={campaign} />
        </div>

        {/* Treasury balance for admin */}
        {displayOptions.showTreasuryBalance &&
          campaign?.treasuryAddress &&
          adminMode && (
            <div className="rounded bg-gray-50 p-2 text-xs text-gray-500">
              <strong>On-chain Treasury:</strong>{' '}
              <TreasuryBalanceCompact
                treasuryAddress={campaign.treasuryAddress}
              />
            </div>
          )}

        {/* Contract addresses for admin */}
        {displayOptions.showContractAddresses && adminMode && (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
            <div className="space-y-3">
              <div>
                <div className="mb-1 font-medium text-gray-600">
                  Campaign Contract:
                </div>
                {campaign?.campaignAddress ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded border bg-white px-2 py-1 font-mono text-xs text-blue-700">
                      {campaign.campaignAddress.slice(0, 10)}...
                      {campaign.campaignAddress.slice(-8)}
                    </code>
                    <CopyText
                      text={campaign.campaignAddress}
                      tooltip="Copy Campaign Address"
                      title="Address Copied"
                      description="Campaign address copied to clipboard"
                    />
                  </div>
                ) : (
                  <div className="font-medium text-red-600">
                    Contract not deployed
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1 font-medium text-gray-600">
                  Treasury Contract:
                </div>
                {campaign?.treasuryAddress ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded border bg-white px-2 py-1 font-mono text-xs text-green-700">
                      {campaign.treasuryAddress.slice(0, 10)}...
                      {campaign.treasuryAddress.slice(-8)}
                    </code>
                    <CopyText
                      text={campaign.treasuryAddress}
                      tooltip="Copy Treasury Address"
                      title="Address Copied"
                      description="Treasury address copied to clipboard"
                    />
                  </div>
                ) : (
                  <div className="font-medium text-orange-600">
                    Treasury not deployed
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin action buttons only */}
        {showButtons && adminMode && (
          <CampaignCardActions
            campaign={campaign}
            showButtons={showButtons}
            customButtons={customButtons}
            adminMode={adminMode}
            displayOptions={displayOptions}
            canDonate={canDonate}
            campaignStatusInfo={campaignStatusInfo}
          />
        )}
      </div>
    </CardFooter>
  );
}
