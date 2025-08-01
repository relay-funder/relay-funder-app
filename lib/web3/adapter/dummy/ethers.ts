// ethers 1522 -> 1837,  200-500ms
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
async function getMockContractReturn(): Promise<IContractReturn> {
  return {
    wait: async () => {
      await new Promise((resolve) => setTimeout(resolve, contractTime));
      return {
        // create payment
        status: 1,
        // getPlatformAdminAddress
        account: '0xd011',
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

interface IPledgeWithoutAReward {
  (address: string, usdc: bigint, options: unknown): Promise<IContractReturn>; // Callable function type
  estimateGas: (address: string, usdc: bigint) => Promise<bigint>; // Method type
}
interface IGetPlatformAdminAddress {
  (bytes: string, options?: unknown): Promise<IContractReturn>; // Callable function type
  estimateGas: (address: string, usdc: bigint) => Promise<bigint>; // Method type
}
interface ITreasuryFactoryDeploy {
  (
    bytes: string,
    amount: number,
    address: string,
    options: unknown,
  ): Promise<IContractReturn>; // Callable function type
  estimateGas: (address: string, usdc: bigint) => Promise<bigint>; // Method type
}
export const ethers = {
  BrowserProvider: class {
    constructor(inputProvider: unknown) {
      console.log('new ethers.BrowserProvider', inputProvider);
    }
    async getSigner() {
      return { address: '0x000bad' };
    }
  },
  Contract: class {
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
  },
  formatUnits(value: number, decimals: number | string) {
    console.log('ethers.formatUnits', { value, decimals });
    if (typeof decimals === 'string') {
      return value.toFixed(2);
    }

    return value.toFixed(decimals);
  },
  isAddress(address: string) {
    console.log('ethers.isAddress', address);
    return true;
  },
  parseUnits(value: string, decimals: number) {
    console.log('ethers.parseUnits', value, decimals);
    return BigInt(parseFloat(value) * 10 ** decimals);
  },
};
