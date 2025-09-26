import { NotificationData } from './types';

export function generateMessage(data: NotificationData): string {
  switch (data.type) {
    case 'CampaignApprove':
      return 'Your campaign has been approved';
    case 'CampaignDisable':
      return 'Your campaign has ended';
    case 'CampaignComment':
      return data.action === 'deleted'
        ? `comment by ${data.userName} was deleted`
        : `comment by ${data.userName} was posted`;
    case 'CampaignPayment':
      return `${data.formattedAmount} donation by ${data.donorName}`;
    case 'CampaignUpdate':
      return 'New update posted';
    default:
      return 'Notification';
  }
}
