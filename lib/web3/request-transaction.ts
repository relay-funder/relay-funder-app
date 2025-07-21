import { ethers, erc20Abi } from '@/lib/web3';
import { USDC_ADDRESS } from '@/lib/constant';
import { type ConnectedWallet } from '@/lib/web3/types';

const debug = process.env.NODE_ENV !== 'production';

export async function requestTransaction({
  wallet,
  address,
  amount,
}: {
  wallet: ConnectedWallet;
  address: string;
  amount: string;
}) {
  if (!wallet || !(await wallet.isConnected())) {
    throw new Error('Wallet not connected');
  }
  const walletProvider = await wallet.getEthereumProvider();
  if (!walletProvider) {
    throw new Error('Wallet not supported or connected');
  }
  const ethersProvider = new ethers.BrowserProvider(walletProvider);
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
    unit = process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6;
  }
  const amountInUSDC = ethers.parseUnits(amount || '0', unit);
  debug && console.log('Amount in USDC:', amountInUSDC.toString());

  // First approve the treasury to spend USDC
  debug && console.log('Treasury address:', address);
  debug && console.log('Approving USDC spend...');
  const approveTx = await usdcContract.approve(address, amountInUSDC);
  debug && console.log('Approval transaction hash:', approveTx.hash);
  await approveTx.wait();
  debug && console.log('USDC approval confirmed');

  // Make the pledge transaction
  debug && console.log('Initializing treasury contract...');
  const treasuryABI = [
    'function pledgeWithoutAReward(address backer, uint256 pledgeAmount, uint256 tip) external',
  ];
  const treasuryContract = new ethers.Contract(address!, treasuryABI, signer);

  debug && console.log('Estimating gas for pledge transaction...');
  let estimatedGas = 220000n;
  const tipAmount = 0n; // No tip for now
  try {
    estimatedGas = await treasuryContract.pledgeWithoutAReward.estimateGas(
      userAddress,
      amountInUSDC,
      tipAmount,
    );
  } catch {}
  debug && console.log('Estimated gas:', estimatedGas.toString());

  debug && console.log('Sending pledge transaction...');
  const tx = await treasuryContract.pledgeWithoutAReward(
    userAddress,
    amountInUSDC,
    tipAmount,
    {
      gasLimit: (estimatedGas * 120n) / 100n,
    },
  );
  debug && console.log('Pledge transaction hash:', tx.hash);
  return tx;
}
