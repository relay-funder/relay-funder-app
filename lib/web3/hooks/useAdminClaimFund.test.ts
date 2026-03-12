import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';

const mockExecute = vi.fn();
vi.mock('./useTreasuryAction', () => ({
  useTreasuryAction: (functionName: string) => {
    if (functionName !== 'claimFund') {
      throw new Error(`Expected claimFund but got ${functionName}`);
    }
    return {
      execute: mockExecute,
      isExecuting: false,
      error: null,
      lastTxHash: undefined,
    };
  },
}));

describe('useAdminClaimFund', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('exposes claimFund function that calls execute', async () => {
    mockExecute.mockResolvedValue({ success: true, hash: '0x123abc' });
    const { useAdminClaimFund } = await import('./useAdminClaimFund');
    const { claimFund } = useAdminClaimFund();

    const result = await claimFund({
      treasuryAddress: '0x1234567890123456789012345678901234567890',
    });

    expect(result.success).toBe(true);
    expect(result.hash).toBe('0x123abc');
    expect(mockExecute).toHaveBeenCalledWith({
      treasuryAddress: '0x1234567890123456789012345678901234567890',
    });
  });

  test('exposes isClaiming state', async () => {
    const { useAdminClaimFund } = await import('./useAdminClaimFund');
    const { isClaiming } = useAdminClaimFund();

    expect(isClaiming).toBe(false);
  });

  test('exposes error state', async () => {
    const { useAdminClaimFund } = await import('./useAdminClaimFund');
    const { error } = useAdminClaimFund();

    expect(error).toBe(null);
  });

  test('exposes lastTxHash state', async () => {
    const { useAdminClaimFund } = await import('./useAdminClaimFund');
    const { lastTxHash } = useAdminClaimFund();

    expect(lastTxHash).toBe(undefined);
  });
});
