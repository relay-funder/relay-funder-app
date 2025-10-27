import { createAppKit, type AppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { defaultChain, celo, daimoPayChains } from '@/lib/web3/config/chains';

import {
  DAIMO_PAY_APP_ID,
  PROJECT_NAME,
  REOWN_CLOUD_PROJECT_ID,
} from '@/lib/constant';
import { getCsrfToken, getSession, signIn, signOut } from 'next-auth/react';

export { chainConfig } from '@/lib/web3/config/chain';
export { config as wagmiConfig } from '@/lib/web3/config/wagmi';

import {
  type SIWESession,
  type SIWEVerifyMessageArgs,
  type SIWECreateMessageArgs,
  createSIWEConfig,
} from '@reown/appkit-siwe';
import { SiweMessage } from 'siwe';
import { loginCallbackUrl } from '@/server/auth/providers/login-callback-url';

// Get projectId from https://dashboard.reown.com
export const projectId =
  REOWN_CLOUD_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

if (!projectId) {
  throw new Error('Web3::Adapter::Appkit: Project ID is not defined');
}

// Start with existing networks
const existingNetworks = [defaultChain] as AppKitNetwork[];
if (defaultChain.id !== celo.id) {
  existingNetworks.push(celo);
}

// Combine existing and Daimo networks, removing duplicates
const allNetworks = [...existingNetworks];

if (DAIMO_PAY_APP_ID && DAIMO_PAY_APP_ID.trim() !== '') {
  daimoPayChains.forEach((network) => {
    if (!allNetworks.some((existing) => existing.id === network.id)) {
      allNetworks.push(network);
    }
  });
}

export const networks = allNetworks as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});
// // @ts-expect-error fixing-error-in-appkit
// wagmiAdapter.clearConnections = () => {};
// // @ts-expect-error fixing-error-in-appkit
// wagmiAdapter.addConnection = () => {};

export const config = wagmiAdapter.wagmiConfig;

export const metadata = {
  name: PROJECT_NAME,
  description: 'Relay Funder App',
  url: process.env.NEXT_PUBLIC_BASE_URL ?? '',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

export const siweConfig = createSIWEConfig({
  signOutOnNetworkChange: false,
  signOutOnAccountChange: true,
  signOutOnDisconnect: true,
  getMessageParams: async () => ({
    domain: typeof window !== 'undefined' ? window.location.host : '',
    uri: typeof window !== 'undefined' ? window.location.origin : '',
    chains: networks.map((network) => parseInt(network.id.toString())),
    statement: 'Please sign with your account',
  }),
  createMessage: ({ address, nonce, chainId }: SIWECreateMessageArgs) => {
    const message = new SiweMessage({
      domain: window.location.host,
      // use rawAddress, will get normalized in api
      address: address.split(':').pop() as `0x${string}`,
      statement: `${PROJECT_NAME} - Please sign this message to log in to the app.`,
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
    });
    return message.prepareMessage();
  },
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) {
      throw new Error('Failed to get nonce!');
    }

    return nonce;
  },
  getSession: async () => {
    const session = await getSession();
    if (!session) {
      return null;
    }

    // Validate address and chainId types
    // session will always contain normalized address
    if (typeof session.user.address !== 'string') {
      return null;
    }

    return {
      address: session.user.address,
      chainId: defaultChain.id,
    } satisfies SIWESession;
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const callbackUrl = loginCallbackUrl();
      await signIn('siwe', {
        message,
        redirect: true,
        signature,
        callbackUrl,
      });
      return true;
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: true,
        redirectTo: '/',
      });

      return true;
    } catch (error) {
      return false;
    }
  },
});
let modal: AppKit | null = null;
// Create the modal
export function createModal() {
  if (modal) {
    return modal;
  }
  modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    defaultNetwork: defaultChain,
    metadata,
    themeMode: 'light',
    features: {
      analytics: false, // Optional - defaults to your Cloud configuration
      email: true, // default to true
      socials: [],
      //   'google',
      //   'x',
      //   'github',
      //   'discord',
      //   'apple',
      //   'facebook',
      //   'farcaster',
      // ],
      emailShowWallets: true, // default to true
    },
    manualWCControl: true,
    themeVariables: {
      '--w3m-accent': '#000000',
      '--w3m-border-radius-master': '1px',
    },
    debug: true,
    siweConfig,
    coinbasePreference: 'eoaOnly',
  });
  return modal;
}
