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
    }
  | {
      type: 'WithdrawalRequested';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      amount: string;
      token: string;
    }
  | {
      type: 'WithdrawalRequestedByAdmin';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      amount: string;
      token: string;
      adminName: string;
    }
  | {
      type: 'WithdrawalApproved';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      amount: string;
      token: string;
      adminName: string;
      transactionHash?: string;
    }
  | {
      type: 'WithdrawalExecuted';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      amount: string;
      token: string;
      transactionHash: string;
      adminName?: string;
    }
  | {
      type: 'TreasuryAuthorized';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      transactionHash: string;
      adminName: string;
    }
  | {
      type: 'WithdrawalUpdated';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      amount: string;
      token: string;
      adminName: string;
      changes: {
        transactionHash?: string | null;
        notes?: string | null;
        approvedById?: number | null;
      };
    }
  | {
      type: 'WithdrawalDeleted';
      withdrawalId: number;
      campaignId: number;
      campaignTitle: string;
      amount: string;
      token: string;
      adminName: string;
    };
