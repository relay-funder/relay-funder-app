import { ethers, erc20Abi } from '@/lib/web3';
import { USDC_ADDRESS } from '@/lib/constant';
import { type ConnectedWallet } from '@/lib/web3/types';
import { DonationProcessStates } from '@/types/campaign';
const debug = process.env.NODE_ENV !== 'production';

export async function requestTransaction({
  wallet,
  address,
  amount,
  tipAmount = '0',
  onStateChanged,
}: {
  wallet: ConnectedWallet;
  address: string;
  amount: string;
  tipAmount?: string;
  onStateChanged: (arg0: keyof typeof DonationProcessStates) => void;
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

  // First approve the treasury to spend USDC (pledge + tip)
  debug && console.log('Treasury address:', address);
  debug && console.log('Approving USDC spend...');
  onStateChanged('approveUsdcContract');
  const approveTx = await usdcContract.approve(address, totalAmount);
  debug && console.log('Approval transaction hash:', approveTx.hash);
  onStateChanged('waitForUsdcContractConfirmation');
  await approveTx.wait();
  debug && console.log('USDC approval confirmed');

  // Make the pledge transaction using parameters from kwr_flow_test.sh
  debug && console.log('Initializing treasury contract...');
  const treasuryABI = [
    'function pledgeWithoutAReward(bytes32 pledgeId, address backer, uint256 pledgeAmount, uint256 tipAmount) external',
  ];
  const treasuryContract = new ethers.Contract(address!, treasuryABI, signer);

  // Generate pledge ID as per shell script pattern
  const pledgeId = ethers.keccak256(
    ethers.toUtf8Bytes(`pledge-${Date.now()}-${userAddress}`),
  );

  debug && console.log('Estimating gas for pledge transaction...');
  let estimatedGas = 220000n;
  try {
    estimatedGas = await treasuryContract.pledgeWithoutAReward.estimateGas(
      pledgeId,
      userAddress,
      pledgeAmountInUSDC,
      tipAmountInUSDC,
    );
  } catch {}
  debug && console.log('Estimated gas:', estimatedGas.toString());

  debug && console.log('Sending pledge transaction...');
  onStateChanged('pledgeContract');
  const tx = await treasuryContract.pledgeWithoutAReward(
    pledgeId,
    userAddress,
    pledgeAmountInUSDC,
    tipAmountInUSDC,
    {
      gasLimit: (estimatedGas * 120n) / 100n,
    },
  );
  debug && console.log('Pledge transaction hash:', tx.hash);
  onStateChanged('waitForPledgeContractConfirmation');
  return tx;
}
