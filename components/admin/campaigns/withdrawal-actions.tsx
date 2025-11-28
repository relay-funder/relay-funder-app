'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Wallet, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { DbCampaign } from '@/types/campaign';
import { OnChainAuthDialog } from '@/components/admin/withdrawals/on-chain-auth-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { resetCampaign } from '@/lib/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';

export function CampaignAuditWithdrawalActions({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const hasTreasury = !!campaign.treasuryAddress;
  const isAuthorized = campaign.treasuryWithdrawalsEnabled ?? false;
  const canWithdraw =
    hasTreasury &&
    isAuthorized &&
    (campaign.status === 'ACTIVE' ||
      campaign.status === 'COMPLETED' ||
      campaign.status === 'FAILED');

  const handleAuthSuccess = () => {
    resetCampaign(campaign.id, queryClient);
    toast({
      title: 'Treasury authorized',
      description: 'Withdrawals are now enabled for this treasury.',
    });
    setAuthDialogOpen(false);
  };

  if (!hasTreasury) {
    return <span className="text-xs text-muted-foreground">No treasury</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Authorize button if not authorized */}
      {!isAuthorized &&
        (campaign.status === 'ACTIVE' ||
          campaign.status === 'COMPLETED' ||
          campaign.status === 'FAILED') && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthDialogOpen(true)}
              className="h-7 text-xs"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Authorize
            </Button>
            {campaign.treasuryAddress && (
              <OnChainAuthDialog
                open={authDialogOpen}
                onOpenChange={setAuthDialogOpen}
                onConfirm={handleAuthSuccess}
                treasuryAddress={campaign.treasuryAddress}
                campaignTitle={campaign.title}
                campaignId={campaign.id}
              />
            )}
          </>
        )}

      {/* Withdrawal management link if authorized */}
      {canWithdraw && (
        <Button variant="outline" size="sm" asChild className="h-7 text-xs">
          <Link
            href={`/admin/withdrawals?campaignId=${campaign.id}`}
            target="_blank"
          >
            <Wallet className="mr-1 h-3 w-3" />
            Manage
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      )}

      {/* Status badge */}
      {hasTreasury &&
        (campaign.status === 'ACTIVE' ||
          campaign.status === 'COMPLETED' ||
          campaign.status === 'FAILED') && (
          <span className="text-xs text-muted-foreground">
            {isAuthorized ? 'Ready' : 'Pending auth'}
          </span>
        )}
    </div>
  );
}
