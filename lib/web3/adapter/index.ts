/**
 * Adapter
 *
 * This file controls the import of the web3 auth adapter
 * unfortunately this cannot be sanely controlled by a constant
 * as the opportunity to 'switch' would mean that all dependent
 * imports are also part of the development bundle.
 * Only developers want to switch the adapter (for trying out new ones
 * or to completely swap out to a dummy interface for enhanced
 * frontend development
 */

export {
  Web3ContextProvider,
  useWeb3Auth,
  useWeb3Context,
  useConnectedAccount,
  // config
  chainConfig,
  wagmiConfig,
  // viem
  encodeAbiParameters,
  parseAbiParameters,
  createPublicClient,
  http,
  parseEther,
  keccak256,
  stringToHex,
  erc20Abi,
  maxUint256,
  decodeEventLog,
  formatUnits,
  BaseError,
  UserRejectedRequestError,
  // wagmi
  readContract,
  createConfig,
  disconnect,
  useConnectorClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useDeployContract,
  useChainId,
  useConfig,
  useConnectors,
  useConnect,
  useDisconnect,
  useSignMessage,
  useAccount,
  useBalance,
  useChains,
  useSwitchChain,
  ConnectorAlreadyConnectedError,
  // ethers
  ethers,
  isDummy,
} from './appkit';
