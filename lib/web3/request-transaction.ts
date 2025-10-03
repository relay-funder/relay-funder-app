import { ethers, erc20Abi } from '@/lib/web3';
import { USDC_ADDRESS } from '@/lib/constant';
import { DonationProcessStates } from '@/types/campaign';
import { debugWeb3 as debug } from '@/lib/debug';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import type { Chain, Client, Transport } from 'viem';

export async function requestTransaction({
  client,
  address,
  amount,
  tipAmount = '0',
  onStateChanged,
}: {
  client: Client<Transport, Chain>;
  address: string;
  amount: string;
  tipAmount?: string;
  onStateChanged: (arg0: keyof typeof DonationProcessStates) => void;
}) {
  if (!client) {
    throw new Error('Wallet not connected');
  }

  const ethersProvider = new ethers.BrowserProvider(client);
  const signer = await ethersProvider.getSigner();
  const userAddress = signer.address;
  if (!USDC_ADDRESS || !ethers.isAddress(USDC_ADDRESS as string)) {
    throw new Error('USDC_ADDRESS is missing or invalid');
  }
  if (!userAddress || !ethers.isAddress(userAddress)) {
    throw new Error('User address is missing or invalid');
  }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new Error('Donation amount is missing or invalid');
  }
  if (!address || !ethers.isAddress(address)) {
    throw new Error('Treasury address is missing or invalid');
  }
  // Initialize contracts
  debug && console.log('Initializing USDC contract...');
  const usdcContract = new ethers.Contract(
    USDC_ADDRESS as string,
    erc20Abi,
    signer,
  );

  let unit: number | string = parseInt(
    process.env.NEXT_PUBLIC_USDC_DECIMALS ?? '',
  );
  if (isNaN(unit)) {
    unit =
      typeof process.env.NEXT_PUBLIC_USDC_DECIMALS === 'string'
        ? parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)
        : 6;
  }
  const pledgeAmountInUSDC = ethers.parseUnits(amount || '0', unit);
  const tipAmountInUSDC = ethers.parseUnits(tipAmount || '0', unit);
  const totalAmount = pledgeAmountInUSDC + tipAmountInUSDC;

  debug && console.log('Pledge amount in USDC:', pledgeAmountInUSDC.toString());
  debug && console.log('Tip amount in USDC:', tipAmountInUSDC.toString());
  debug && console.log('Total amount in USDC:', totalAmount.toString());

  // Generate pledge ID as per shell script pattern (must be done first)
  const pledgeId = ethers.keccak256(
    ethers.toUtf8Bytes(`pledge-${Date.now()}-${userAddress}`),
  );
  debug && console.log('Generated pledge ID:', pledgeId);

  // Set payment gateway fee BEFORE pledge (required by KeepWhatsRaised)
  // Even for direct wallet pledges, the pledge ID must be registered with a fee (can be 0)
  debug && console.log('Setting payment gateway fee for pledge...');
  const treasuryContract = new ethers.Contract(address!, KeepWhatsRaisedABI, signer);

  try {
    // TODO: Set via env variable. For direct pledges we set it as 0
    const gatewayFee = 0n; // No gateway fee for direct wallet pledges
    const gatewayFeeTx = await treasuryContract.setPaymentGatewayFee(pledgeId, gatewayFee);
    debug && console.log('Gateway fee transaction hash:', gatewayFeeTx.hash);
    await gatewayFeeTx.wait();
    debug && console.log('Gateway fee registered successfully');
  } catch (gatewayFeeError) {
    console.error('Failed to set payment gateway fee:', gatewayFeeError);
    throw new Error('Failed to register pledge with treasury. Please try again.');
  }

  // First approve the treasury to spend USDC (pledge + tip)
  debug && console.log('Treasury address:', address);
  debug && console.log('Approving USDC spend...');
  onStateChanged('approveUsdcContract');
  const approveTx = await usdcContract.approve(address, totalAmount);
  debug && console.log('Approval transaction hash:', approveTx.hash);
  onStateChanged('waitForUsdcContractConfirmation');
  await approveTx.wait();
  debug && console.log('USDC approval confirmed');

  // Make the pledge transaction
  debug && console.log('Estimating gas for pledge transaction...');
  let estimatedGas = 220000n;
  try {
    estimatedGas = await treasuryContract.pledgeWithoutAReward.estimateGas(
      pledgeId,
      userAddress,
      pledgeAmountInUSDC,
      tipAmountInUSDC,
    );
  } catch (gasEstimateError) {
    debug && console.warn('Gas estimation failed, using default:', estimatedGas);
  }
  debug && console.log('Estimated gas:', estimatedGas.toString());

  debug && console.log('Sending pledge transaction...');
  onStateChanged('pledgeContract');
  const tx = await treasuryContract.pledgeWithoutAReward(
    pledgeId,
    userAddress,
    pledgeAmountInUSDC,
    tipAmountInUSDC,
    {
      gasLimit: (estimatedGas * 120n) / 100n, // 20% buffer for gas
    },
  );
  debug && console.log('Pledge transaction hash:', tx.hash);
  onStateChanged('waitForPledgeContractConfirmation');
  return tx;
}
