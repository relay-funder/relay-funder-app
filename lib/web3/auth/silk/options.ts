import { PROJECT_NAME, REOWN_CLOUD_PROJECT_ID } from '@/lib/constant';

import type { InitSilkOptions } from '@silk-wallet/silk-wallet-sdk';

export const options: InitSilkOptions = {
  useStaging: true,
  config: {
    styles: { darkMode: true },
    allowedSocials: [],
    authenticationMethods: ['wallet'],
  },
  walletConnectProjectId: REOWN_CLOUD_PROJECT_ID,
  project: {
    name: PROJECT_NAME,
    // logo: '',
    // origin: getOrigin(),
    //    projectId:
    // termsOfServiceUrl: `${baseUrl}/terms-of-service`,
    // privacyPolicyUrl: `${baseUrl}/privacy-policy`,
  },
};
console.log(options);
