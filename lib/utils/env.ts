

export type AppEnvironment = 'development' | 'staging' | 'production';

export const APP_ENV: AppEnvironment = (() => {

  if (process.env.NEXT_PUBLIC_APP_ENV) {
    return process.env.NEXT_PUBLIC_APP_ENV as AppEnvironment;
  }


  const vercelEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV;

  if (vercelEnv === 'production') return 'production';
  if (vercelEnv === 'preview') return 'staging';


  return 'development';
})();


export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_STAGING = APP_ENV === 'staging';
export const IS_PRODUCTION = APP_ENV === 'production';


export const SHOULD_LOG_ANALYTICS = IS_DEVELOPMENT;

export const SHOULD_SEND_ANALYTICS = !IS_DEVELOPMENT;


export const USE_TESTNET = !IS_PRODUCTION;
export const ALLOW_DEMO_DATA = IS_DEVELOPMENT;
