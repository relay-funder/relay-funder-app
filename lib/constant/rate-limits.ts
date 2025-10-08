import { RateLimits } from '../api/types';
import { ONE_DAY_MS, ONE_MINUTE_MS } from './time';

const CAMPAIGN_CREATE_RATE_LIMIT_IP_WINDOW =
  parseInt(process.env.CAMPAIGN_CREATE_IP_WINDOW || '', 10) || ONE_MINUTE_MS;

const CAMPAIGN_CREATE_RATE_LIMIT_IP_LIMIT =
  parseInt(process.env.CAMPAIGN_CREATE_IP_LIMIT || '', 10) || 20;

const CAMPAIGN_CREATE_RATE_LIMIT_USER_WINDOW =
  parseInt(process.env.CAMPAIGN_CREATE_USER_WINDOW || '', 10) || ONE_DAY_MS;

const CAMPAIGN_CREATE_RATE_LIMIT_USER_LIMIT =
  parseInt(process.env.CAMPAIGN_CREATE_USER_LIMIT || '', 10) || 5;

export const RATE_LIMITS: RateLimits = {
  '/api/campaigns:POST': {
    ip: {
      window: CAMPAIGN_CREATE_RATE_LIMIT_IP_WINDOW,
      limit: CAMPAIGN_CREATE_RATE_LIMIT_IP_LIMIT,
    },
    user: {
      window: CAMPAIGN_CREATE_RATE_LIMIT_USER_WINDOW,
      limit: CAMPAIGN_CREATE_RATE_LIMIT_USER_LIMIT,
    },
  },
};
