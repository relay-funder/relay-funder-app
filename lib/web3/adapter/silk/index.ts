import { silk } from './connector';
import { options } from './options';

export const connector = silk(options);

export { useAuth } from './use-auth';
export { useWallet } from './use-wallet';
export { useChain } from '../common/use-chain';
export { Web3ContextProvider } from './context-provider';
