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
  estimateGas: (address: string, usdc: bigint) => Promise<bigint>; // Method type
}
interface IPledgeWithoutAReward extends IContractBase {
  (address: string, usdc: bigint, options: unknown): Promise<IContractReturn>; // Callable function type
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
}
export class JsonRpcProvider {
  constructor(rpcUrl?: string) {
    console.log('new ethers.JsonRpcProvider', rpcUrl);
  }
}
export class Contract {
  name: IContractSimpleString;
  symbol: IContractSimpleString;
  campaignName: IContractSimpleString;
  defaultTokenURI: IContractSimpleString;
  owner: IContractSimpleString;
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
