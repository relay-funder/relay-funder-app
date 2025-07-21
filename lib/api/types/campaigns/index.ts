export interface CampaignsWithIdParams {
  params: Promise<{
    campaignId: string;
  }>;
}

export interface PostCampaignsWithIdApproveBody {
  treasuryAddress?: string; // Legacy support - kept for backward compatibility
  // New dual treasury support
  cryptoTreasuryAddress?: string;
  paymentTreasuryAddress?: string;
  cryptoTreasuryTx?: string;
  paymentTreasuryTx?: string;
}

export interface PostCampaignsWithIdUpdatesBody {
  title?: string;
  content?: string;
}

export interface PostCampaignsRouteBody {
  campaignId: number;
  roundIds: number[];
}
