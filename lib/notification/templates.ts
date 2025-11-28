import { NotificationData } from './types';

export function generateMessage(data: NotificationData): string {
  switch (data.type) {
    case 'CampaignApprove':
      return `Your campaign "${data.campaignTitle}" has been approved`;
    case 'CampaignDisable':
      return `Your campaign "${data.campaignTitle}" has ended`;
    case 'CampaignComment':
      return data.action === 'deleted'
        ? `comment by ${data.userName} was deleted on "${data.campaignTitle}"`
        : `comment by ${data.userName} was posted on "${data.campaignTitle}"`;
    case 'CampaignPayment':
      return `${data.formattedAmount} donation by ${data.donorName} to "${data.campaignTitle}"`;
    case 'CampaignUpdate':
      return `New update posted on "${data.campaignTitle}"`;
    case 'ProfileCompleted':
      return `User ${data.userName} has completed their profile`;
    case 'CampaignShare':
      return `Someone visited "${data.campaignTitle}" via your share link by ${data.sharerName}`;
    case 'WithdrawalRequested':
      return `Withdrawal request for ${data.amount} ${data.token} from "${data.campaignTitle}"`;
    case 'WithdrawalRequestedByAdmin':
      return `Admin ${data.adminName} created a withdrawal request for ${data.amount} ${data.token} from "${data.campaignTitle}"`;
    case 'WithdrawalApproved':
      return `Withdrawal request for ${data.amount} ${data.token} from "${data.campaignTitle}" has been approved${data.transactionHash ? ' and executed' : ''} by ${data.adminName}`;
    case 'WithdrawalExecuted':
      return `Withdrawal of ${data.amount} ${data.token} from "${data.campaignTitle}" has been executed${data.adminName ? ` by ${data.adminName}` : ''}`;
    case 'TreasuryAuthorized':
      return `Treasury withdrawals have been enabled for "${data.campaignTitle}" by ${data.adminName}`;
    case 'WithdrawalUpdated':
      const changeParts: string[] = [];
      if (data.changes.transactionHash !== undefined) {
        changeParts.push(data.changes.transactionHash ? 'transaction hash updated' : 'transaction hash removed');
      }
      if (data.changes.notes !== undefined) {
        changeParts.push(data.changes.notes ? 'notes updated' : 'notes removed');
      }
      if (data.changes.approvedById !== undefined) {
        changeParts.push(data.changes.approvedById ? 'approval status updated' : 'approval removed');
      }
      const changesText = changeParts.length > 0 ? changeParts.join(', ') : 'details updated';
      return `Withdrawal for ${data.amount} ${data.token} from "${data.campaignTitle}" has been updated (${changesText}) by ${data.adminName}`;
    case 'WithdrawalDeleted':
      return `Withdrawal request for ${data.amount} ${data.token} from "${data.campaignTitle}" has been deleted by ${data.adminName}`;
    default:
      return 'Notification';
  }
}
