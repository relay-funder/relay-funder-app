import { createRateLimiter } from './factory';
import {
  CAMPAIGN_CREATE_RATE_LIMIT_IP_LIMIT,
  CAMPAIGN_CREATE_RATE_LIMIT_IP_WINDOW,
  CAMPAIGN_CREATE_RATE_LIMIT_USER_LIMIT,
  CAMPAIGN_CREATE_RATE_LIMIT_USER_WINDOW,
} from '@/lib/constant/rate-limits';

export const ipLimiterCreateCampaign = createRateLimiter({
  requests: CAMPAIGN_CREATE_RATE_LIMIT_IP_LIMIT,
  window: CAMPAIGN_CREATE_RATE_LIMIT_IP_WINDOW,
  prefix: 'ratelimit:/api/campaigns:POST:ip',
});

export const userLimiterCreateCampaign = createRateLimiter({
  requests: CAMPAIGN_CREATE_RATE_LIMIT_USER_LIMIT,
  window: CAMPAIGN_CREATE_RATE_LIMIT_USER_WINDOW,
  prefix: 'ratelimit:/api/campaigns:POST:user',
});
