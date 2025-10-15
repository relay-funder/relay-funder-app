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
    default:
      return 'Notification';
  }
}
