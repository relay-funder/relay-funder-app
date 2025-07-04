// ethers 1522 -> 1837,  200-500ms
// export { ethers } from 'ethers';
const contractTime = 500;
interface IContractReturn {
  wait: () => Promise<{ status: number }>;
  hash: string;
}
async function getMockContractReturn(): Promise<IContractReturn> {
  return {
    wait: async () => {
      await new Promise((resolve) => setTimeout(resolve, contractTime));
      return { status: 1 };
    },
    hash: `0x${Math.round(Math.random() * 100000).toString(16)}`,
  };
}

interface IPledgeWithoutAReward {
  (
    address: string,
    usdc: number,
    options: unknown,
  ): (
    address: string,
    usdc: number,
    options: unknown,
  ) => Promise<IContractReturn>; // Callable function type
  estimateGas: () => Promise<bigint>; // Method type
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
    constructor(address: string, abi: unknown, signer: unknown) {
      const pledgeWithoutAReward: IPledgeWithoutAReward = (async (
        address: string,
        usdc: number,
        options: unknown,
      ) => {
        console.log('pledgeWithoutAReward', { address, usdc, options });
        return getMockContractReturn();
      }) as unknown as IPledgeWithoutAReward;
      pledgeWithoutAReward.estimateGas = async () => {
        return 100000n;
      };
      this.pledgeWithoutAReward = pledgeWithoutAReward;
      console.log('new ethers.Contract', address, abi, signer);
    }
    async balanceOf() {
      await new Promise((resolve) => setTimeout(resolve, contractTime));
      return Math.random() * 1000 + 100;
    }
    async approve(address: string, usdc: number, options?: unknown) {
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
