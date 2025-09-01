import { DisplayUserWithStates } from '../../user';
import { DbComment } from '@/types/campaign';
export interface GetCampaignCommentResponseInstance extends DbComment {
  creator: DisplayUserWithStates;
}
export interface GetCampaignCommentResponse {
  comment: GetCampaignCommentResponseInstance;
}
