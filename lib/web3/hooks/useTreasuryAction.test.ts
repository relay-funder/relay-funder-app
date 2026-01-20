import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';

// Mock React hooks
vi.mock('react', () => ({
  useState: vi.fn((initial) => [initial, vi.fn()]),
  useCallback: vi.fn((fn) => fn),
}));

// Mock viem isAddress
vi.mock('viem', () => ({
  isAddress: (addr: string) => addr.startsWith('0x') && addr.length === 42,
}));

// Mock web3 dependencies
const mockWriteContractAsync = vi.fn();
vi.mock('@/lib/web3', () => ({
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
  }),
}));

// Mock the ABI
vi.mock('@/contracts/abi/KeepWhatsRaised', () => ({
  KeepWhatsRaisedABI: [
    { name: 'claimTip', type: 'function' },
    { name: 'disburseFees', type: 'function' },
  ],
}));

describe('useTreasuryAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('with claimTip function', () => {
    test('returns error for invalid treasury address', async () => {
      const { useTreasuryAction } = await import('./useTreasuryAction');
      const { execute } = useTreasuryAction('claimTip');

      const result = await execute({ treasuryAddress: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid treasury address');
      expect(mockWriteContractAsync).not.toHaveBeenCalled();
    });

    test('calls writeContractAsync with correct parameters for valid address', async () => {
      mockWriteContractAsync.mockResolvedValue('0xabcdef123456');
      const { useTreasuryAction } = await import('./useTreasuryAction');
      const { execute } = useTreasuryAction('claimTip');

      const validAddress = '0x1234567890123456789012345678901234567890';
      const result = await execute({ treasuryAddress: validAddress });

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
      const { useTreasuryAction } = await import('./useTreasuryAction');
      const { execute } = useTreasuryAction('claimTip');

      const validAddress = '0x1234567890123456789012345678901234567890';
      const result = await execute({ treasuryAddress: validAddress });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction reverted');
    });

    test('handles non-Error exceptions', async () => {
      mockWriteContractAsync.mockRejectedValue('string error');
      const { useTreasuryAction } = await import('./useTreasuryAction');
      const { execute } = useTreasuryAction('claimTip');

      const validAddress = '0x1234567890123456789012345678901234567890';
      const result = await execute({ treasuryAddress: validAddress });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('with disburseFees function', () => {
    test('calls writeContractAsync with disburseFees function name', async () => {
      mockWriteContractAsync.mockResolvedValue('0xfedcba654321');
      const { useTreasuryAction } = await import('./useTreasuryAction');
      const { execute } = useTreasuryAction('disburseFees');

      const validAddress = '0x1234567890123456789012345678901234567890';
      const result = await execute({ treasuryAddress: validAddress });

      expect(result.success).toBe(true);
      expect(result.hash).toBe('0xfedcba654321');
      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        address: validAddress,
        abi: expect.any(Array),
        functionName: 'disburseFees',
        args: [],
      });
    });
  });
});
