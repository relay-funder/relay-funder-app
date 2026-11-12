import { describe, expect, test, vi } from 'vitest';
import { ethers } from 'ethers';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { hasMatchingPledgeReceipt } from './verify-wallet-pledge';

vi.mock('@/lib/api/pledges/celo-rpc', () => ({ readFromCeloRpc: vi.fn() }));

const treasuryInterface = new ethers.Interface(KeepWhatsRaisedABI);
const treasuryAddress = '0xAbCdEf0000000000000000000000000000001234';
const backerAddress = '0x123450000000000000000000000000000000AbCd';
const otherAddress = '0x9999900000000000000000000000000000009999';

function receiptLog({
  emitter = treasuryAddress,
  backer = backerAddress,
  pledgeAmount = 10_100_000n,
}: {
  emitter?: string;
  backer?: string;
  pledgeAmount?: bigint;
} = {}) {
  const event = treasuryInterface.getEvent('Receipt');
  if (!event) throw new Error('Receipt event missing from ABI');
  const encoded = treasuryInterface.encodeEventLog(event, [
    backer,
    ethers.ZeroHash,
    pledgeAmount,
    0n,
    1n,
    [],
  ]);
  return { address: emitter, topics: encoded.topics, data: encoded.data };
}

const expectation = {
  treasuryAddress,
  backerAddress,
  minPledgeAmount: 10_000_000n,
};

describe('hasMatchingPledgeReceipt', () => {
  test('accepts a Receipt from the treasury for the backer, ignoring address casing', () => {
    expect(
      hasMatchingPledgeReceipt([receiptLog()], {
        ...expectation,
        treasuryAddress: treasuryAddress.toLowerCase(),
        backerAddress: backerAddress.toUpperCase().replace('0X', '0x'),
      }),
    ).toBe(true);
  });

  test('rejects a Receipt emitted by a different contract', () => {
    expect(
      hasMatchingPledgeReceipt(
        [receiptLog({ emitter: otherAddress })],
        expectation,
      ),
    ).toBe(false);
  });

  test('rejects a Receipt for a different backer', () => {
    expect(
      hasMatchingPledgeReceipt(
        [receiptLog({ backer: otherAddress })],
        expectation,
      ),
    ).toBe(false);
  });

  test('rejects a pledge smaller than the recorded donation', () => {
    expect(
      hasMatchingPledgeReceipt(
        [receiptLog({ pledgeAmount: 1_000_000n })],
        expectation,
      ),
    ).toBe(false);
  });

  test('ignores unrelated logs such as ERC20 transfers', () => {
    const unrelatedLog = {
      address: treasuryAddress,
      topics: [ethers.id('Transfer(address,address,uint256)')],
      data: '0x',
    };
    expect(hasMatchingPledgeReceipt([unrelatedLog], expectation)).toBe(false);
    expect(hasMatchingPledgeReceipt([], expectation)).toBe(false);
  });
});
