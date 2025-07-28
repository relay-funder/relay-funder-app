// wagmi/core  1837->2522 + 500ms

// ~680 modules
export { readContract, createConfig } from '@wagmi/core';
// ~1250 modules
export {
  useConnectorClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useDeployContract,
  useConfig,
  useChainId,
  useConnectors,
  useConnect,
  useDisconnect,
  useSignMessage,
  useAccount,
  useBalance,
  useChains,
  useSwitchChain,
  ConnectorAlreadyConnectedError,
} from 'wagmi';
