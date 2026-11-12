import { ApiConflictError } from '@/lib/api/error';
import { readFromCeloRpc } from '@/lib/api/pledges/celo-rpc';
import { USD_DECIMALS } from '@/lib/constant';
import { logFactory } from '@/lib/debug';
import { ethers } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';

const logVerbose = logFactory('verbose', 'VerifyWalletPledge');

const RECEIPT_POLL_ATTEMPTS = 10;
const RECEIPT_POLL_INTERVAL_MS = 2_000;

const treasuryInterface = new ethers.Interface(KeepWhatsRaisedABI);

interface ReceiptLog {
  address: string;
  topics: readonly string[];
  data: string;
}

export interface PledgeExpectation {
  treasuryAddress: string;
  backerAddress: string;
  /** Minimum pledge amount in token base units (the donation amount before the protocol fee) */
  minPledgeAmount: bigint;
}

/**
 * Returns true when the logs contain a KeepWhatsRaised `Receipt` event emitted by the
 * expected treasury, for the expected backer, with at least the expected pledge amount.
 */
export function hasMatchingPledgeReceipt(
  logs: readonly ReceiptLog[],
  { treasuryAddress, backerAddress, minPledgeAmount }: PledgeExpectation,
): boolean {
  const treasury = treasuryAddress.toLowerCase();
  const backer = backerAddress.toLowerCase();

  return logs.some((log) => {
    if (log.address.toLowerCase() !== treasury) return false;

    let parsed: ethers.LogDescription | null;
    try {
      parsed = treasuryInterface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
    } catch {
      return false;
    }
    if (!parsed || parsed.name !== 'Receipt') return false;

    const eventBacker = String(parsed.args.backer).toLowerCase();
    const pledgeAmount = BigInt(parsed.args.pledgeAmount);
    return eventBacker === backer && pledgeAmount >= minPledgeAmount;
  });
}

async function fetchReceipt(
  transactionHash: string,
): Promise<ethers.TransactionReceipt | null> {
  for (let attempt = 1; attempt <= RECEIPT_POLL_ATTEMPTS; attempt++) {
    const receipt = await readFromCeloRpc(
      {
        operation: 'getTransactionReceipt',
        context: { transactionHash, attempt },
      },
      (provider) => provider.getTransactionReceipt(transactionHash),
    );
    if (receipt) return receipt;
    await new Promise((resolve) =>
      setTimeout(resolve, RECEIPT_POLL_INTERVAL_MS),
    );
  }
  return null;
}

/**
 * Verifies on Celo that a direct-wallet donation actually pledged into the campaign
 * treasury before the payment is marked confirmed. Throws ApiConflictError otherwise.
 */
export async function verifyWalletPledge({
  transactionHash,
  treasuryAddress,
  backerAddress,
  amount,
}: {
  transactionHash: string;
  treasuryAddress: string;
  backerAddress: string;
  amount: string;
}): Promise<void> {
  if (!/^0x[0-9a-fA-F]{64}$/.test(transactionHash)) {
    throw new ApiConflictError('Invalid transaction hash');
  }

  const receipt = await fetchReceipt(transactionHash);
  if (!receipt) {
    throw new ApiConflictError(
      `Transaction ${transactionHash} not found on Celo`,
    );
  }
  if (receipt.status !== 1) {
    throw new ApiConflictError(`Transaction ${transactionHash} reverted`);
  }

  const expectation: PledgeExpectation = {
    treasuryAddress,
    backerAddress,
    minPledgeAmount: ethers.parseUnits(amount, USD_DECIMALS),
  };
  if (!hasMatchingPledgeReceipt(receipt.logs, expectation)) {
    throw new ApiConflictError(
      `Transaction ${transactionHash} has no matching pledge to treasury ${treasuryAddress}`,
    );
  }

  logVerbose('Wallet pledge verified on-chain', {
    transactionHash,
    treasuryAddress,
  });
}
