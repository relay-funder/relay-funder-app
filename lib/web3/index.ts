export { useWeb3Context } from './context-provider';
export {
  Web3ContextProvider,
  useWeb3Auth,
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
  // dummy indicator for bypassing complex contract code
  isDummy,
} from './adapter';
export { useCurrentChain } from './use-current-chain';
export { preloadWeb3Modules, disconnectWallet } from './auth';
