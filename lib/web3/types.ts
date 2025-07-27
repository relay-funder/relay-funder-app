// types used from ethers and viem
// type imports have no impact on dev-performance
export type { Signer } from 'ethers';
export type {
  Address,
  Hash,
  Client,
  Transport,
  Log,
  Abi,
  BaseError,
  WriteContractParameters,
  Chain,
} from 'viem';

// common types
interface RequestArguments {
  method: string;
  params?:
    | {
        chainId: string;
        chainName?: string;
        nativeCurrency?: { decimals: number; name: string; symbol: string };
        rpcUrls?: string[];
        blockExplorerUrls?: string[];
      }[]
    | undefined;
}

export type EthereumProvider = {
  request: (args: RequestArguments) => Promise<unknown>;
  on: (event: string, handler: (payload: unknown) => void) => void;
  removeListener: (event: string, handler: (payload: unknown) => void) => void;
};
export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

export interface ConnectedWallet {
  address?: string;
  chainId?: number;
  isConnected: () => Promise<boolean>;
  getEthereumProvider: () => Promise<EthereumProvider | undefined>;
}

export interface IWeb3UseAuthHook {
  address?: string;
  wallet?: ConnectedWallet;
  authenticating: boolean;
  connecting: boolean;
  error?: Error;

  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}
