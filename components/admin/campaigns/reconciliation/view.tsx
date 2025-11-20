'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { ArrowLeft, Edit, Eye, ExternalLink } from 'lucide-react';
import { CampaignReconciliationTable } from './table';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { useCampaignReconciliationStream } from '@/lib/hooks/useCampaignReconciliation';
import { getBlockExplorerAddressUrl } from '@/lib/format-address';

interface CampaignReconciliationViewProps {
  campaignId: string;
}

export function CampaignReconciliationView({
  campaignId,
}: CampaignReconciliationViewProps) {
  // Note: Authentication is handled server-side, so we can assume user is admin

  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = useCampaign(campaignId);
  const {
    data: reconciliationData,
    error: reconciliationError,
    refetch: refetchReconciliation,
    isLoading: reconciliationLoading,
  } = useCampaignReconciliationStream(campaignId);

  // Only block on campaign loading - show page immediately with DB data
  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (campaignError || reconciliationError || !campaign?.campaign) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Failed to load {campaignError ? 'campaign' : 'reconciliation'}{' '}
              data. Please try again.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Error:{' '}
              {(campaignError || reconciliationError)?.message ||
                'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const campaignData = campaign.campaign;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Campaign Reconciliation</h1>
            <p className="text-muted-foreground">{campaignData.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/campaigns/${campaignData.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Published
            </Button>
          </Link>
          <Link href={`/admin/campaigns/${campaignData.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Campaign ID:</span>
              <div className="font-mono">{campaignData.id}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="capitalize">{campaignData.status}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Treasury Address:</span>
              <div className="break-all font-mono text-xs">
                {campaignData.treasuryAddress ? (
                  <Link
                    href={getBlockExplorerAddressUrl(
                      campaignData.treasuryAddress,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {campaignData.treasuryAddress}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  'Not deployed'
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Campaign Address:</span>
              <div className="break-all font-mono text-xs">
                {campaignData.campaignAddress || 'Not deployed'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Transaction Reconciliation Table */}
      <CampaignReconciliationTable
        campaignId={parseInt(campaignId)}
        reconciliationData={reconciliationData}
        error={reconciliationError || undefined}
        onRefresh={refetchReconciliation}
        isRefreshing={reconciliationLoading}
      />
    </div>
  );
}
