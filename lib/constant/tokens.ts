export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  '0x01C5C0122039549AD1493B8220cABEdD739BC44E'; // Celo/Sepolia
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS) ?? 6;
export const USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ??
  '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e'; // https://blog.celo.org/tether-token-usdt-is-now-available-on-celo-2f0a518d3ef5
export const USDT_DECIMALS = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS) ?? 6;

export const USD_TOKEN: 'USDC' | 'USDT' =
  process.env.NEXT_PUBLIC_USD_TOKEN === 'USDC' ? 'USDC' : 'USDT';
export const USD_ADDRESS = USD_TOKEN === 'USDC' ? USDC_ADDRESS : USDT_ADDRESS;
export const USD_DECIMALS =
  USD_TOKEN === 'USDC' ? USDC_DECIMALS : USDT_DECIMALS;
