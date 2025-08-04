// 1522->2332 modules ~200ms

// export {
//   encodeAbiParameters,
//   parseAbiParameters,
//   createPublicClient,
//   http,
//   parseEther,
//   erc20Abi,
//   maxUint256,
//   keccak256,
//   stringToHex,
//   decodeEventLog,
// } from 'viem';

export function encodeAbiParameters(
  params: unknown,
  values: readonly unknown[],
) {
  console.log('dummy encodeAbiParameters:', { params, values });
  return '0x';
}
export function parseAbiParameters(params: string[]) {
  console.log('dummy parseAbiParameters', { params });
  return [];
}
export function createPublicClient(params: unknown) {
  console.log('dummy createPublicClient', params);
  return {
    getLogs: async (params: unknown) => {
      console.log('dummy createPublicClient::client::getLogs', params);
      return [] as {
        transactionHash: `0x${string}`;
        args?: {
          owner?: `0x${string}`;
          launchTime?: bigint;
          deadline?: bigint;
          goalAmount?: bigint;
        };
      }[];
    },
  };
}
export function http(url: string) {
  console.log('dummy http', url);
}
export function parseEther(value: string): string {
  console.log('dummy parseEther', value);
  return value;
}
export function keccak256(input: string): string {
  return input;
}
export function stringToHex(input: string): string {
  return input;
}
export function parseUnits(value: string, decimals: number | string) {
  console.log('dummy::viem::parseUnits', { value, decimals });
  return BigInt(parseInt(value));
}

export const maxUint256 = 2n ** 256n - 1n;
export function decodeEventLog(params: unknown) {
  console.log('dummy::viem::decodeEventLog', params);
  return { eventName: 'dummy', args: {} };
}
export function formatUnits(value: bigint, decimals: number) {
  console.log('dummy::viem::formatUnits', { value, decimals });
  let display = value.toString();

  const negative = display.startsWith('-');
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, '0');

  const integer = display.slice(0, display.length - decimals);
  let fraction = display.slice(display.length - decimals);
  fraction = fraction.replace(/(0+)$/, '');
  return `${negative ? '-' : ''}${integer || '0'}${
    fraction ? `.${fraction}` : ''
  }`;
}

export const erc20Abi = [];
export class BaseError extends Error {
  shortMessage: string;
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.shortMessage = message;
  }
}
export class UserRejectedRequestError extends Error {}
