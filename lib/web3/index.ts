export { useWeb3Context, getProvider } from './context-provider';
export {
  useAuth,
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
  // wagmi
  readContract,
  createConfig,
  useConnectorClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useDeployContract,
  useChainId,
  useConfig,
  // ethers
  ethers,
} from './adapter';
export { useCurrentChain } from './use-current-chain';
