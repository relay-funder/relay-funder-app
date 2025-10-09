export type NotificationData =
  | { type: 'CampaignApprove'; campaignId: number; campaignTitle: string }
  | { type: 'CampaignDisable'; campaignId: number; campaignTitle: string }
  | {
      type: 'CampaignComment';
      campaignId: number;
      campaignTitle: string;
      action: 'posted' | 'deleted';
      userName: string;
      comment?: string;
    }
  | {
      type: 'CampaignPayment';
      campaignId: number;
      campaignTitle: string;
      paymentId: number;
      formattedAmount: string;
      donorName: string;
    }
  | {
      type: 'CampaignUpdate';
      campaignId: number;
      campaignTitle: string;
      updateText: string;
    }
  | {
      type: 'ProfileCompleted';
      userName: string;
    }
  | {
      type: 'CampaignShare';
      campaignId: number;
      campaignTitle: string;
      sharerName: string;
      pointsEarned: number;
    };
