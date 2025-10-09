import { createRateLimiter } from './factory';
import {
  CAMPAIGN_CREATE_RATE_LIMIT_IP_LIMIT,
  CAMPAIGN_CREATE_RATE_LIMIT_IP_WINDOW,
  CAMPAIGN_CREATE_RATE_LIMIT_USER_LIMIT,
  CAMPAIGN_CREATE_RATE_LIMIT_USER_WINDOW,
  CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_IP_LIMIT,
  CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_IP_WINDOW,
  CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_USER_LIMIT,
  CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_USER_WINDOW,
  REGISTER_PLEDGE_RATE_LIMIT_IP_LIMIT,
  REGISTER_PLEDGE_RATE_LIMIT_IP_WINDOW,
  REGISTER_PLEDGE_RATE_LIMIT_USER_LIMIT,
  REGISTER_PLEDGE_RATE_LIMIT_USER_WINDOW,
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

export const ipLimiterCreateCampaignOnChain = createRateLimiter({
  requests: CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_IP_LIMIT,
  window: CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_IP_WINDOW,
  prefix: 'ratelimit:/api/campaigns[id]/create-onchain:POST:ip',
});

export const userLimiterCreateCampaignOnChain = createRateLimiter({
  requests: CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_USER_LIMIT,
  window: CAMPAIGN_CREATE_ONCHAIN_RATE_LIMIT_USER_WINDOW,
  prefix: 'ratelimit:/api/campaigns[id]/create-onchain:POST:user',
});

export const ipLimiterRegisterPledge = createRateLimiter({
  requests: REGISTER_PLEDGE_RATE_LIMIT_IP_LIMIT,
  window: REGISTER_PLEDGE_RATE_LIMIT_IP_WINDOW,
  prefix: 'ratelimit:/api/pledges/register:POST:ip',
});

export const userLimiterRegisterPledge = createRateLimiter({
  requests: REGISTER_PLEDGE_RATE_LIMIT_USER_LIMIT,
  window: REGISTER_PLEDGE_RATE_LIMIT_USER_WINDOW,
  prefix: 'ratelimit:/api/pledges/register:POST:user',
});
