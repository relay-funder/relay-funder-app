// ethers 1522 -> 1837,  200-500ms
import type { Signer as ethersSigner } from 'ethers';
// export { ethers } from 'ethers';
const contractTime = 3000;
interface IContractReturn {
  wait: () => Promise<{
    status: number;
    account: `0x${string}`;
    events: {
      event: string;
      args: { treasuryAddress: string; campaignInfo: string };
    }[];
    logs: { topics: string[]; address: string }[];
  }>;
  hash: string;
}
async function getMockContractReturn() {
  return {
    wait: async () => {
      await new Promise((resolve) => setTimeout(resolve, contractTime));
      return {
        // create payment
        status: 1,
        // getPlatformAdminAddress
        account: (localStorage.getItem('dummyAuthAccount') ??
          '0x00') as `0x${string}`,
        // CampaignNFTabi
        name: 'DUMMYCampaignNFTabi',
        symbol: 'DUMMY',
        campaignName: 'Dummy Campaign',
        campaignOwner: '0x00',
        campaignTreasury: '0x00',
        campaignDefaultTokenURI: '',
        // CampaignNFTFactory
        address: `0x${Math.round(Math.random() * 100000).toString(16)}`,
        // treasuryFacory.deploy
        events: [
          {
            event: 'TreasuryFactoryTreasuryDeployed',
            args: {
              treasuryAddress: `0x${Math.round(Math.random() * 100000).toString(16)}`,
              campaignInfo: `0x${Math.round(Math.random() * 100000).toString(16)}`,
            },
          },
        ],
        // CampaignInfoFactoryCampaignCreated
        logs: [
          {
            topics: ['CampaignInfoFactoryCampaignCreated(bytes32,address)'],
            adhress: `0x${Math.round(Math.random() * 100000).toString(16)}`,
          },
        ],
      };
    },
    hash: `0x${Math.round(Math.random() * 100000).toString(16)}`,
  };
}
type IContractSimpleStringReturn = string;
async function getMockContractSimpleStringReturn() {
  // any type:
  return `0x${Math.round(Math.random() * 100000).toString(16)}` as unknown as IContractSimpleStringReturn;
}
async function getMockContractDeterministicStringReturn(data: unknown) {
  // any type:
  const stringData = JSON.stringify(data);
  const buffer = Buffer.from(stringData, 'utf-8');
  const hexString = buffer.toString('hex');

  // Return the hex string with '0x' prefix
  return `0x${hexString}`;
}
type IContractSimpleNumberReturn = number;
async function getMockContractSimpleNumberReturn() {
  // any type:
  return Math.round(Math.random() * 100000);
}

interface IContractBase {
  estimateGas: (
    arg0: string | bigint,
    arg1: string | bigint,
    arg2?: bigint,
    arg3?: bigint,
    options?: { gasLimit: bigint },
  ) => Promise<bigint>; // Method type
}
interface IPledgeWithoutAReward extends IContractBase {
  (
    id: string,
    address: string,
    usdc: bigint,
    tip: bigint,
    options: unknown,
  ): Promise<IContractReturn>; // Callable function type
}
interface IGetPlatformAdminAddress extends IContractBase {
  (bytes: string, options?: unknown): Promise<IContractReturn>; // Callable function type
}
interface ITreasuryFactoryDeploy extends IContractBase {
  (
    bytes: string,
    amount: number,
    address: string,
    options: unknown,
  ): Promise<IContractReturn>; // Callable function type
}
interface IContractSimpleString extends IContractBase {
  (): Promise<IContractSimpleStringReturn>;
}
interface IContractStringString extends IContractBase {
  (arg0: string): Promise<IContractSimpleStringReturn>;
}

interface IContractIContractBigintStringNumber extends IContractBase {
  (arg0: bigint, arg1: string): Promise<IContractSimpleNumberReturn>;
}
interface IContractCreateCampaign extends IContractBase {
  (
    address: string,
    identifierHash: string,
    hashes: string[],
    dataKeys: string[],
    dataValues: string[],
    data: readonly [number, number, bigint],
  ): Promise<IContractReturn>; // Callable function type
}

export class Provider {
  constructor(rpcUrl?: string) {
    console.log('new ethers.Provider', rpcUrl);
  }
}
export class Signer {
  constructor(rpcUrl?: string) {
    console.log('new ethers.Signer', rpcUrl);
  }
}
export class BrowserProvider {
  constructor(inputProvider: unknown, network?: unknown) {
    console.log('new ethers.BrowserProvider', inputProvider, network);
  }
  async getSigner(address?: string) {
    console.log('dummy BrowserProvider.getSigner', address);
    return {
      address: (localStorage.getItem('dummyAuthAccount') ??
        '0x000bad') as `0x${string}`,
    } as unknown as ethersSigner & {
      address: `0x${string}`;
    };
  }
  async send(message: string, data: unknown) {
    console.log('dummy BrowserProvider.send', message, data);
  }
  async getCode(address: string) {
    console.log('dummy BrowserProvider.getCode', address);
    return address;
  }
}
export class JsonRpcProvider {
  constructor(rpcUrl?: string) {
    console.log('new ethers.JsonRpcProvider', rpcUrl);
  }
  async getBlock(address: string) {
    console.log('dummy BrowserProvider.getBlock', address);
    return { timestamp: Math.floor(Date.now() / 1000) };
  }
}
export class Wallet {
  constructor(pk: string, provider: JsonRpcProvider) {
    console.log('new ethers.Wallet', pk, provider);
  }
}
export class Contract {
  name: IContractSimpleString;
  symbol: IContractSimpleString;
  campaignName: IContractSimpleString;
  defaultTokenURI: IContractSimpleString;
  owner: IContractSimpleString;
  createCampaign: IContractCreateCampaign;
  campaignTreasury: IContractSimpleString;

  getCampaignNFT: IContractStringString;

  getRecipientStatus: IContractIContractBigintStringNumber;

  pledgeWithoutAReward: IPledgeWithoutAReward;
  getPlatformAdminAddress: IGetPlatformAdminAddress;
  deploy: ITreasuryFactoryDeploy;
  constructor(address: string, abi: unknown, signer: unknown) {
    const pledgeWithoutAReward: IPledgeWithoutAReward = (async (
      address: string,
      usdc: bigint,
      options: unknown,
    ) => {
      console.log('pledgeWithoutAReward', { address, usdc, options });
      return getMockContractReturn();
    }) as unknown as IPledgeWithoutAReward;
    pledgeWithoutAReward.estimateGas = async () => {
      return 100000n;
    };
    this.pledgeWithoutAReward = pledgeWithoutAReward;
    const getPlatformAdminAddress: IGetPlatformAdminAddress = (async (
      bytes: string,
    ) => {
      console.log('getPlatformAdminAddress', { bytes });
      return getMockContractReturn();
    }) as unknown as IGetPlatformAdminAddress;
    pledgeWithoutAReward.estimateGas = async () => {
      return 100000n;
    };
    this.getPlatformAdminAddress = getPlatformAdminAddress;
    const deploy: ITreasuryFactoryDeploy = (async (
      bytes: string,
      amount: number,
      address: string,
    ) => {
      console.log('deploy', { bytes, amount, address });
      return getMockContractReturn();
    }) as unknown as ITreasuryFactoryDeploy;
    pledgeWithoutAReward.estimateGas = async () => {
      return 100000n;
    };
    this.deploy = deploy;
    const name: IContractSimpleString = (async () => {
      console.log('name');
      return getMockContractSimpleStringReturn();
    }) as unknown as IContractSimpleString;
    name.estimateGas = async () => {
      return 100000n;
    };
    this.name = name;
    const symbol: IContractSimpleString = (async () => {
      console.log('symbol');
      return getMockContractSimpleStringReturn();
    }) as unknown as IContractSimpleString;
    symbol.estimateGas = async () => {
      return 100000n;
    };
    this.symbol = symbol;
    const campaignName: IContractSimpleString = (async () => {
      console.log('campaignName');
      return getMockContractSimpleStringReturn();
    }) as unknown as IContractSimpleString;
    campaignName.estimateGas = async () => {
      return 100000n;
    };
    this.campaignName = campaignName;
    const defaultTokenURI: IContractSimpleString = (async () => {
      console.log('defaultTokenURI');
      return getMockContractSimpleStringReturn();
    }) as unknown as IContractSimpleString;
    defaultTokenURI.estimateGas = async () => {
      return 100000n;
    };
    this.defaultTokenURI = campaignName;
    const owner: IContractSimpleString = (async () => {
      console.log('owner');
      return getMockContractSimpleStringReturn();
    }) as unknown as IContractSimpleString;
    owner.estimateGas = async () => {
      return 100000n;
    };
    this.owner = owner;
    const campaignTreasury: IContractSimpleString = (async () => {
      console.log('campaignTreasury');
      return getMockContractSimpleStringReturn();
    }) as unknown as IContractSimpleString;
    campaignTreasury.estimateGas = async () => {
      return 100000n;
    };
    this.campaignTreasury = campaignName;
    const getCampaignNFT: IContractStringString = (async (
      campaignId: string,
    ) => {
      console.log('getCampaignNFT', campaignId);
      return getMockContractDeterministicStringReturn(campaignId);
    }) as unknown as IContractStringString;
    getCampaignNFT.estimateGas = async () => {
      return 100000n;
    };
    this.getCampaignNFT = getCampaignNFT;
    const getRecipientStatus: IContractIContractBigintStringNumber = (async (
      poolId: bigint,
      recipientId: string,
    ) => {
      console.log('getRecipientStatus', poolId, recipientId);
      return getMockContractSimpleNumberReturn();
    }) as unknown as IContractIContractBigintStringNumber;
    getRecipientStatus.estimateGas = async () => {
      return 100000n;
    };
    this.getRecipientStatus = getRecipientStatus;
    const createCampaign: IContractCreateCampaign = (async () => {
      console.log('createCampaign');
      return getMockContractReturn();
    }) as unknown as IContractCreateCampaign;
    createCampaign.estimateGas = async () => {
      return 100000n;
    };
    this.createCampaign = createCampaign;
    console.log('new ethers.Contract', address, abi, signer);
  }
  async balanceOf() {
    await new Promise((resolve) => setTimeout(resolve, contractTime));
    return Math.random() * 1000 + 100;
  }
  async approve(address: string, usdc: bigint, options?: unknown) {
    console.log('approve', { address, usdc, options });
    return getMockContractReturn();
  }
  connect(signer: { address: `0x${string}` }) {
    console.log('connect', { signer });
    return this;
  }
  interface() {
    return null;
  }
}
export function formatUnits(value: number | bigint, decimals: number | string) {
  console.log('ethers.formatUnits', { value, decimals });
  if (typeof value === 'number') {
    if (typeof decimals === 'string') {
      return value.toFixed(2);
    }

    return value.toFixed(decimals);
  }
  if (typeof decimals === 'string') {
    return Number(value).toFixed(2);
  }

  return Number(value).toFixed(decimals);
}
export function isAddress(address: string) {
  console.log('ethers.isAddress', address);
  return true;
}
export function parseUnits(value: string, decimals: number) {
  console.log('ethers.parseUnits', value, decimals);
  return BigInt(parseFloat(value) * 10 ** decimals);
}
export function getAddress(address: string) {
  return address;
}
export class AbiCoder {
  static defaultAbiCoder() {
    return {
      encode: (input: unknown, data: unknown) => {
        console.log('ethers.AbiCoder.defaultAbiCoder.encode', input, data);
        return data as string;
      },
    };
  }
}
export function hexlify(data: unknown) {
  return `0xdummy${data}`;
}
export function toUtf8Bytes(str: string) {
  console.log('dummy ethers toUtf8Bytes', str);
  const result: Array<number> = [];
  return result;
}
export function keccak256(data: string | Uint8Array | number[]) {
  console.log('dummy ethers keccak256', data);
  return '0x' + 'a'.repeat(64);
}
export function id(data: string) {
  console.log('dummy ethers id', data);
  return data;
}
export interface ParamType {
  name: string; // Name of the parameter
  type: string; // Type of the parameter (e.g., 'address', 'uint256', etc.)
  indexed?: boolean; // Indicates if the parameter is indexed (optional)
}
export interface FunctionFragment {
  name: string; // Name of the function
  inputs: ParamType[]; // Array of input parameter types
  outputs: ParamType[]; // Array of output parameter types
  format: (format?: string) => string; // Method to format the function fragment
}
export interface ContractTransactionResponse {
  hash: string; // Transaction hash
  to: string; // Recipient address
  from: string; // Sender address
  nonce: number; // Nonce of the transaction
  gasLimit: number; // Gas limit for the transaction
  gasPrice: number; // Gas price for the transaction
  data: string; // Transaction data
  value: string; // Value sent with the transaction
  chainId: number; // Chain ID of the transaction
  wait: (confirmations?: number) => Promise<MockTransactionReceipt>; // Method to wait for transaction confirmations
}

interface MockTransactionReceipt {
  blockNumber: number; // Block number where the transaction was included
  transactionHash: string; // Hash of the transaction
  from: string; // Address of the sender
  to: string; // Address of the recipient
  contractAddress?: string; // Address of the contract (if applicable)
  logs: Array<MockLog>; // Array of logs generated by the transaction
  status: number; // Status of the transaction (1 for success, 0 for failure)
}
interface MockLog {
  address: string; // Address of the contract that generated the log
  data: string; // Log data
  topics: string[]; // Array of topics associated with the log
  blockNumber: number; // Block number where the log was created
  transactionHash: string; // Hash of the transaction that generated the log
  logIndex: number; // Index of the log in the block
}
