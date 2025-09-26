export type NotificationData =
  | { type: 'CampaignApprove'; campaignId: number }
  | { type: 'CampaignDisable'; campaignId: number }
  | {
      type: 'CampaignComment';
      campaignId: number;
      action: 'posted' | 'deleted';
      userName: string;
    }
  | {
      type: 'CampaignPayment';
      campaignId: number;
      paymentId: number;
      formattedAmount: string;
      donorName: string;
    }
  | { type: 'CampaignUpdate'; campaignId: number };
