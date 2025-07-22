export { useWeb3Context, getProvider } from './context-provider';
export {
  useWeb3Auth,
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
  BaseError,
  UserRejectedRequestError,
  // wagmi
  readContract,
  createConfig,
  useConnectorClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useDeployContract,
  useChainId,
  useConfig,
  useConnectors,
  useConnect,
  useSignMessage,
  useAccount,
  // ethers
  ethers,
} from './adapter';
export { useCurrentChain } from './use-current-chain';
