import { ethers, erc20Abi } from '@/lib/web3';
import { USDC_ADDRESS } from '@/lib/constant';
import { type ConnectedWallet } from '@/lib/web3/types';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';

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

  debug && console.log('=== DONATION TRANSACTION DEBUG ===');
  debug && console.log('User address:', userAddress);
  debug && console.log('Treasury address:', address);
  debug && console.log('USDC address:', USDC_ADDRESS);
  debug && console.log('Amount:', amount);

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

  // Check USDC balance first
  try {
    const balance = await usdcContract.balanceOf(userAddress);
    debug && console.log('User USDC balance:', balance.toString());
    if (balance < amountInUSDC) {
      throw new Error(`Insufficient USDC balance. Required: ${amountInUSDC.toString()}, Available: ${balance.toString()}`);
    }
  } catch (error) {
    debug && console.error('Error checking USDC balance:', error);
    throw new Error('Failed to check USDC balance');
  }

  // First approve the treasury to spend USDC
  debug && console.log('Treasury address:', address);
  debug && console.log('Approving USDC spend...');
  const approveTx = await usdcContract.approve(address, amountInUSDC);
  debug && console.log('Approval transaction hash:', approveTx.hash);
  await approveTx.wait();
  debug && console.log('USDC approval confirmed');

  // Verify approval was successful
  try {
    const allowance = await usdcContract.allowance(userAddress, address);
    debug && console.log('USDC allowance after approval:', allowance.toString());
    if (allowance < amountInUSDC) {
      throw new Error(`USDC approval failed. Expected: ${amountInUSDC.toString()}, Got: ${allowance.toString()}`);
    }
  } catch (error) {
    debug && console.error('Error checking USDC allowance:', error);
    throw new Error('Failed to verify USDC approval');
  }

  // Make the pledge transaction using full KeepWhatsRaised ABI
  debug && console.log('Initializing treasury contract...');
  const treasuryContract = new ethers.Contract(address!, KeepWhatsRaisedABI, signer);

  // Check if treasury contract exists
  try {
    const code = await ethersProvider.getCode(address);
    if (code.length <= 2) {
      throw new Error('Treasury contract not found at the specified address');
    }
    debug && console.log('Treasury contract confirmed at address');
  } catch (error) {
    debug && console.error('Error checking treasury contract:', error);
    throw new Error('Treasury contract validation failed');
  }

  // Check if treasury contract is properly configured
  try {
    debug && console.log('Checking treasury configuration...');
    const goalAmount = await treasuryContract.getGoalAmount();
    const launchTime = await treasuryContract.getLaunchTime();
    const deadline = await treasuryContract.getDeadline();
    
    debug && console.log('Treasury goal amount:', goalAmount.toString());
    debug && console.log('Treasury launch time:', launchTime.toString());
    debug && console.log('Treasury deadline:', deadline.toString());
    
    // Check if values are set (non-zero indicates configuration)
    if (goalAmount === 0n && launchTime === 0n && deadline === 0n) {
      throw new Error('Treasury contract is not configured. Please contact admin to configure the treasury.');
    }
    
    // Check if campaign is active (current time between launch and deadline)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < Number(launchTime)) {
      throw new Error('Campaign has not started yet');
    }
    if (currentTime > Number(deadline)) {
      throw new Error('Campaign has ended');
    }
    
    debug && console.log('Treasury configuration verified');
  } catch (error) {
    debug && console.error('Treasury configuration check failed:', error);
    if (error instanceof Error && error.message.includes('not configured')) {
      throw error; // Re-throw our specific error
    }
    throw new Error('Treasury contract appears to be unconfigured. The contract may need initialization by an admin.');
  }

  debug && console.log('Estimating gas for pledge transaction...');
  let estimatedGas = 220000n;
  const tipAmount = 0n; // No tip for now
  try {
    estimatedGas = await treasuryContract.pledgeWithoutAReward.estimateGas(
      userAddress,
      amountInUSDC,
      tipAmount,
    );
    debug && console.log('Gas estimation successful:', estimatedGas.toString());
  } catch (gasError) {
    debug && console.error('Gas estimation failed:', gasError);
    // Try to get more detailed error information
    try {
      await treasuryContract.pledgeWithoutAReward.staticCall(
        userAddress,
        amountInUSDC,
        tipAmount,
      );
    } catch (staticError) {
      debug && console.error('Static call failed:', staticError);
      throw new Error(`Transaction would revert: ${staticError}`);
    }
    // Keep default gas limit if estimation fails but static call succeeds
  }
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
