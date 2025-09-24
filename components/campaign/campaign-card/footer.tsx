import { CardFooter } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FormattedDate } from '../../formatted-date';
import { CampaignProgress } from '../progress';
import { TreasuryBalanceCompact } from '../treasury-balance';
import { CopyText } from '@/components/copy-text';
import { CampaignCardDisplayOptions } from './types';
import { CampaignCardActions } from './actions';
import { useAuth } from '@/contexts';

interface CampaignStatusInfo {
  status: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  description: string;
  canDonate: boolean;
}

interface CampaignCardFooterProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  adminMode: boolean;
  showButtons: boolean;
  customButtons?: React.ReactNode;
  canDonate: boolean;
  campaignStatusInfo: CampaignStatusInfo;
  // Round-specific props
  round?: GetRoundResponseInstance;
  roundCampaign?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    id: number;
    campaignId: number;
  };
  roundAdminFooterControls?: React.ReactNode;
  // Card type for context-aware rendering
  cardType?: 'standard' | 'dashboard' | 'admin' | 'round' | 'round-minimal';
}

export function CampaignCardFooter({
  campaign,
  displayOptions,
  adminMode,
  showButtons,
  customButtons,
  canDonate,
  campaignStatusInfo,
  round,
  roundCampaign,
  roundAdminFooterControls,
  cardType = 'standard',
}: CampaignCardFooterProps) {
  const { address } = useAuth();
  const isOwner = campaign?.creatorAddress === address;
  return (
    <CardFooter className="mt-auto p-6 pt-0">
      <div className="w-full space-y-4">
        {/* Round Applications - Show for campaign owners and admins, but hide on homepage */}
        {campaign?.rounds &&
          campaign?.rounds?.length > 0 &&
          (adminMode || isOwner) &&
          cardType !== 'standard' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Round Applications:
              </h4>
              <ul className="space-y-1">
                {campaign.rounds.map((round: GetRoundResponseInstance) => (
                  <li
                    key={round.id}
                    className="border-l-2 border-blue-200 pl-2 text-sm text-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <span>{round.title}</span>
                      {round.recipientStatus && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                            round.recipientStatus === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : round.recipientStatus === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {round.recipientStatus === 'APPROVED'
                            ? 'approved'
                            : round.recipientStatus === 'REJECTED'
                              ? 'rejected'
                              : 'pending'}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Date information for admin and round variants */}
        {displayOptions.showDates && (
          <div
            className={`text-sm ${displayOptions.layoutVariant === 'minimal' ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 gap-4'}`}
          >
            {campaign.startTime && (
              <div>
                <span className="text-gray-500">
                  <strong>Launch:</strong>
                </span>
                {displayOptions.layoutVariant === 'minimal' ? ' ' : <br />}
                <FormattedDate date={campaign.startTime} />
              </div>
            )}
            {campaign.endTime && (
              <div>
                <span className="text-gray-500">
                  <strong>Deadline:</strong>
                </span>
                {displayOptions.layoutVariant === 'minimal' ? ' ' : <br />}
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

        {/* Round admin controls - only render if controls exist */}
        {displayOptions.showRoundAdminFooterControls &&
          roundAdminFooterControls && <div>{roundAdminFooterControls}</div>}

        {/* Campaign admin actions - only when explicitly enabled */}
        {showButtons &&
          adminMode &&
          displayOptions.showCampaignAdminActions && (
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <h4 className="text-sm font-medium text-gray-700">
                Campaign Actions:
              </h4>
              <CampaignCardActions
                campaign={campaign}
                showButtons={showButtons}
                customButtons={customButtons}
                adminMode={adminMode}
                displayOptions={displayOptions}
                canDonate={canDonate}
                campaignStatusInfo={campaignStatusInfo}
              />
            </div>
          )}
      </div>
    </CardFooter>
  );
}
