import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';

// Mock React hooks
vi.mock('react', () => ({
  useState: vi.fn((initial) => [initial, vi.fn()]),
  useCallback: vi.fn((fn) => fn),
}));

// Mock web3 dependencies
const mockWriteContractAsync = vi.fn();
vi.mock('@/lib/web3', () => ({
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
  }),
  ethers: {
    isAddress: (addr: string) => addr.startsWith('0x') && addr.length === 42,
  },
}));

// Mock the ABI
vi.mock('@/contracts/abi/KeepWhatsRaised', () => ({
  KeepWhatsRaisedABI: [{ name: 'claimTip', type: 'function' }],
}));

describe('useAdminClaimTip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns error for invalid treasury address', async () => {
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { claimTip } = useAdminClaimTip();

    const result = await claimTip({ treasuryAddress: 'invalid' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid treasury address');
    expect(mockWriteContractAsync).not.toHaveBeenCalled();
  });

  test('calls writeContractAsync with correct parameters for valid address', async () => {
    mockWriteContractAsync.mockResolvedValue('0xabcdef123456');
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { claimTip } = useAdminClaimTip();

    const validAddress = '0x1234567890123456789012345678901234567890';
    const result = await claimTip({ treasuryAddress: validAddress });

    expect(result.success).toBe(true);
    expect(result.hash).toBe('0xabcdef123456');
    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: validAddress,
      abi: expect.any(Array),
      functionName: 'claimTip',
      args: [],
    });
  });

  test('returns error when contract call fails', async () => {
    mockWriteContractAsync.mockRejectedValue(new Error('Transaction reverted'));
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { claimTip } = useAdminClaimTip();

    const validAddress = '0x1234567890123456789012345678901234567890';
    const result = await claimTip({ treasuryAddress: validAddress });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Transaction reverted');
  });

  test('handles non-Error exceptions', async () => {
    mockWriteContractAsync.mockRejectedValue('string error');
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { claimTip } = useAdminClaimTip();

    const validAddress = '0x1234567890123456789012345678901234567890';
    const result = await claimTip({ treasuryAddress: validAddress });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown error');
  });
});
