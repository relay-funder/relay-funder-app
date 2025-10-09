import { ONE_DAY_MS, ONE_MINUTE_MS } from './time';

export const CAMPAIGN_CREATE_RATE_LIMIT_IP_WINDOW =
  parseInt(process.env.CAMPAIGN_CREATE_IP_WINDOW || '', 10) || ONE_MINUTE_MS;

export const CAMPAIGN_CREATE_RATE_LIMIT_IP_LIMIT =
  parseInt(process.env.CAMPAIGN_CREATE_IP_LIMIT || '', 10) || 20;

export const CAMPAIGN_CREATE_RATE_LIMIT_USER_WINDOW =
  parseInt(process.env.CAMPAIGN_CREATE_USER_WINDOW || '', 10) || ONE_DAY_MS;

export const CAMPAIGN_CREATE_RATE_LIMIT_USER_LIMIT =
  parseInt(process.env.CAMPAIGN_CREATE_USER_LIMIT || '', 10) || 5;
